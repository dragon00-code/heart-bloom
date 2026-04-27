# Heart Bloom / Classic Snake

这个仓库里有两个小项目：

1. `heart-bloom/`：一个手机和桌面都能玩的爱心粒子动画页面
2. `src/game.js` + `test/`：经典贪吃蛇的核心游戏逻辑和单元测试

顶层的 `index.html` 会自动跳转到 `heart-bloom/`，所以直接启动仓库后看到的是爱心动画页面。

## 环境要求

- Node.js
- npm

## 安装依赖

当前仓库没有额外依赖，直接使用 Node.js 即可。

## 启动项目

在仓库根目录执行：

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

启动后用浏览器打开：

```bash
http://0.0.0.0:3000
```

页面会先跳转到：

```bash
http://0.0.0.0:3000/heart-bloom/
```

如果 `3000` 端口被占用，可以换成别的端口，例如：

```bash
HOST=0.0.0.0 PORT=3001 npm start
```

## 项目一：Heart Bloom

`heart-bloom/` 是一个基于原生 `HTML + CSS + JavaScript` 的交互式爱心特效页面。

### 功能

- 点击按钮点亮爱心
- 点击屏幕任意位置会触发爱心粒子爆发
- 拖动屏幕时会形成爱心轨迹
- 支持 `prefers-reduced-motion`，会自动降低动画强度
- 兼容移动端和桌面端

### 文件结构

- `heart-bloom/index.html`：页面结构
- `heart-bloom/styles.css`：页面样式
- `heart-bloom/app.js`：动画和交互逻辑

### 直接访问

如果本地服务器已经启动，也可以直接打开：

```bash
http://0.0.0.0:3000/heart-bloom/
```

## 项目二：Classic Snake

`src/game.js` 提供了贪吃蛇的核心规则，`test/game.test.js` 负责验证这些规则是否正确。

### 已实现的逻辑

- 蛇按当前方向移动
- 吃到食物后增长并加分
- 禁止直接反向移动
- 撞墙结束游戏
- 撞到自己结束游戏
- 食物不会生成在蛇身上

### 测试

运行单元测试：

```bash
npm test
```

## 目录说明

- `index.html`：仓库根入口，自动跳转到 `heart-bloom/`
- `server.js`：本地静态服务器
- `heart-bloom/`：爱心动画项目
- `src/game.js`：贪吃蛇核心逻辑
- `test/game.test.js`：贪吃蛇逻辑测试

## 一句话快速开始

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

然后在浏览器里打开本地地址，就可以先看到 `Heart Bloom` 页面；如果想验证贪吃蛇核心逻辑，再执行 `npm test`。
