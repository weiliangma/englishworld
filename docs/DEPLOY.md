# EnglishWorld — 编译与部署文档

> 从开发到上线，让孩子能在手机上用起来

---

## 一、快速启动（开发环境）

### 后端

```bash
cd backend

# 创建虚拟环境（首次）
python3.11 -m venv venv

# 安装依赖
./venv/bin/pip install -r requirements.txt

# 启动开发服务器（热重载）
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 `http://localhost:8000/health` → `{"status": "ok"}`

### 前端

```bash
cd frontend

# 安装依赖（首次）
npm install

# 启动开发服务器
npx vite --host 0.0.0.0 --port 5173
```

访问 `http://localhost:5173` → EnglishWorld 首页

> 开发时前端通过 Vite proxy 将 `/api` 请求转发到后端 `localhost:8000`，不需要手动配置跨域。

---

## 二、环境变量

### 后端（`backend/.env`）

```bash
# 数据库（默认 SQLite，部署用 PostgreSQL）
DATABASE_URL=sqlite:///./englishworld.db
# DATABASE_URL=postgresql://user:pass@localhost:5432/englishworld

# 音频文件目录
AUDIO_DIR=./audio

# 服务端口
PORT=8000

# 日志级别
LOG_LEVEL=info
```

### 前端（`frontend/.env.production`）

```bash
# 后端 API 地址（部署后改成真实域名）
VITE_API_URL=https://api.yourdomain.com
```

---

## 三、生产环境编译

### 编译前端

```bash
cd frontend
npm run build
```

编译产物在 `frontend/dist/` 目录：
```
dist/
├── index.html
├── assets/
│   ├── index-xxx.js        # 主 JS
│   ├── index-xxx.css       # 主 CSS
│   └── ...                  # 其他 chunk
└── favicon.svg
```

### 编译后端（Python 无需编译）

后端代码直接运行，不需要编译步骤。

---

## 四、部署方案

### 方案 A：单机部署（推荐，¥30/月）

适合给孩子一个人用，最简单。

**配置：** 腾讯云轻量应用服务器 / 阿里云轻量云服务器  
**规格：** 2核 / 2GB 内存 / 60GB 硬盘 / 5Mbps 带宽  
**费用：** 约 ¥30-50/月  
**系统：** Ubuntu 22.04 / Debian 12 / CentOS 9

#### 步骤

```bash
# 1. 安装依赖
apt update && apt install -y nginx python3.11 python3.11-venv nodejs npm

# 2. 拉取代码
git clone https://github.com/weiliangma/englishworld.git /opt/englishworld
cd /opt/englishworld

# 3. 编译前端
cd frontend && npm install && npm run build

# 4. 配置后端服务
cd ../backend
python3.11 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install gunicorn  # 生产环境 WSGI 服务器
```

#### 使用 systemd 管理后端

```bash
cat > /etc/systemd/system/englishworld-backend.service << 'EOF'
[Unit]
Description=EnglishWorld Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/englishworld/backend
ExecStart=/opt/englishworld/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5
Environment=DATABASE_URL=sqlite:////opt/englishworld/backend/englishworld.db

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable englishworld-backend
systemctl start englishworld-backend
```

#### 配置 Nginx 反向代理

```nginx
cat > /etc/nginx/sites-available/englishworld << 'EOF'
server {
    listen 80;
    server_name englishworld.fun www.englishworld.fun;
    # 如果没有域名，用 ip 地址：
    # server_name _;

    # 前端静态文件
    root /opt/englishworld/frontend/dist;
    index index.html;

    # 前端路由（处理 React 路由刷新 404）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 音频文件缓存
    location /audio/ {
        alias /opt/englishworld/backend/audio/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
EOF

ln -s /etc/nginx/sites-available/englishworld /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

#### 配置 HTTPS（Let's Encrypt，有域名时）

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d englishworld.fun -d www.englishworld.fun
```

### 方案 B：Docker 部署（高级）

适合有 Docker 经验的用户，环境一致性更好。

#### Dockerfile（后端）

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Nginx + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./backend/englishworld.db:/app/englishworld.db
      - ./backend/audio:/app/audio
    environment:
      - DATABASE_URL=sqlite:///app/englishworld.db
    restart: always

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    restart: always
```

### 方案 C：本地局域网部署（最简单，¥0）

适合家里有台旧电脑/树莓派/NAS，孩子在家用手机/平板通过内网访问。

```bash
# 在家庭服务器上执行
cd /opt/englishworld

# 编译前端
cd frontend && npm install && npm run build && cd ..

# 启动后端（带静态文件服务）
cd backend
./venv/bin/pip install aiofiles
```

修改 `backend/app/main.py`，添加静态文件服务：

```python
from fastapi.staticfiles import StaticFiles

# 在 app 初始化后添加
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
```

然后启动后端：
```bash
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 80
```

孩子用手机浏览器输入 `http://服务器IP` 即可访问。

---

## 五、数据库迁移

### SQLite 自动建表

当前使用 `Base.metadata.create_all(bind=engine)` 自动建表，无需手动迁移。适合开发和小规模部署。

### Alembic 生产迁移（推荐）

```bash
cd backend

# 初始化 Alembic
./venv/bin/alembic init alembic

# 配置 alembic.ini
# sqlalchemy.url = sqlite:///./englishworld.db

# 生成迁移脚本
./venv/bin/alembic revision --autogenerate -m "init"

# 执行迁移
./venv/bin/alembic upgrade head
```

---

## 六、音频文件生成

第一次部署后需要生成听力 MP3 和单词发音文件：

```bash
cd backend
./venv/bin/python -c "
import asyncio
from app.services.audio_generator import generate_all_audio
asyncio.run(generate_all_audio())
"
```

所有音频文件生成到 `backend/audio/` 目录，约 200MB（1600 个单词 + 30 篇短文）。

---

## 七、健康检查与监控

部署后验证接口：

```bash
# 后端健康检查
curl http://localhost:8000/health
# → {"status":"ok","app":"EnglishWorld"}

# API 测试
curl http://localhost:8000/api/v1/stats
# → {"level":1,"experience":0,"coins":50,...}

curl http://localhost:8000/api/v1/skills
# → [{"id":1,"name":"一般现在时",...}]
```

### 日志查看

```bash
# 后端日志
journalctl -u englishworld-backend -f

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 八、更新流程

每次修改代码后：

```bash
cd /opt/englishworld

# 1. 拉取最新代码
git pull

# 2. 重新编译前端
cd frontend && npm install && npm run build && cd ..

# 3. 重启后端
systemctl restart englishworld-backend

# 4. 如果需要，执行数据库迁移
cd backend && ./venv/bin/alembic upgrade head && cd ..
```

---

## 九、备份策略

```bash
# 数据库备份（定时任务）
0 3 * * * cp /opt/englishworld/backend/englishworld.db /opt/backup/englishworld-$(date +\%Y\%m\%d).db

# 只保留最近 30 天的备份
0 4 * * * find /opt/backup -name "englishworld-*.db" -mtime +30 -delete
```

---

## 十、性能参考

| 指标 | 数值 |
|---|---|
| 前端首次加载 | ~200KB JS + ~50KB CSS + ~100KB 字体 |
| 后端内存占用 | ~80MB (空闲) / ~150MB (负载) |
| 数据库大小 | ~5MB (1000 次答题记录) |
| API 响应时间 | <50ms (本地) / <200ms (公网) |
| 并发支持 | 单机 >50 人同时答题（给孩子一个人用绰绰有余） |

---

## 十一、故障排查

| 问题 | 排查步骤 |
|---|---|
| 前端白屏 | F12 → Console 看是否有报错 → 检查 `VITE_API_URL` 是否正确 |
| API 返回 404 | 检查 Nginx proxy_pass 路径 → 确认后端进程是否运行 |
| 数据库报错 | `ls -la backend/englishworld.db` → 检查文件权限 → www-data 用户可读写 |
| 音频无法播放 | 检查 `backend/audio/` 目录是否存在 MP3 文件 |
| 页面刷新 404 | 检查 Nginx 配置中的 `try_files $uri $uri/ /index.html;` |
| 端口被占用 | `ss -tlnp | grep 8000` → 找到占用进程 → `kill` |
