# Heart Bloom / Classic Snake

这个仓库已经整理成可以直接用 GitHub Pages 部署的静态站点结构。

## 站点入口

- `/`：仓库首页，展示两个项目入口
- `/heart-bloom/`：爱心粒子动画 Demo
- `/snake/`：贪吃蛇核心逻辑说明页

## 目录结构

- `index.html`：GitHub Pages 首页，使用相对路径链接两个项目
- `heart-bloom/`：爱心动画页面
- `snake/`：贪吃蛇说明页
- `src/game.js`：贪吃蛇核心规则
- `test/game.test.js`：贪吃蛇单元测试
- `server.js`：本地静态服务器

## GitHub Pages 部署方式

在 GitHub 仓库设置里，把 Pages 的发布源指向：

- `Deploy from a branch`
- 分支选择当前仓库分支
- 目录选择 `/(root)`

因为页面都使用相对路径，所以部署到仓库根目录后可以直接访问：

```text
https://<username>.github.io/<repo-name>/
```

## 本地启动

如果你想先本地预览，执行：

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

然后打开浏览器访问本地地址即可。

## 功能说明

### Heart Bloom

`heart-bloom/` 是一个原生 `HTML + CSS + JavaScript` 的交互式爱心粒子动画页面。

- 点击按钮点亮爱心
- 点击屏幕任意位置会触发粒子爆发
- 拖动屏幕时会形成爱心轨迹
- 兼容移动端和桌面端

### Classic Snake

`src/game.js` 保存贪吃蛇核心规则，`test/game.test.js` 保存测试用例。

- 蛇按当前方向移动
- 吃到食物后增长并加分
- 禁止直接反向移动
- 撞墙结束游戏
- 撞到自己结束游戏
- 食物不会生成在蛇身上

## 测试

运行单元测试：

```bash
npm test
```

## 快速开始

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

打开首页后可以进入 `Heart Bloom`，或跳转到 `Snake` 说明页查看源码和测试入口。
