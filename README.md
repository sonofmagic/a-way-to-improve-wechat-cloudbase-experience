# 抛砖引玉：一种改善微信云开发 , 开发者体验的思路

> 本篇文章写于 2021-02-27  
> 鄙人才疏学浅，如有谬误，欢迎指正  
> 更多代码的细节在 [**Github源码链接**](https://github.com/sonofmagic/a-way-to-improve-wechat-cloudbase-experience) 中

## 前言

小程序云开发，作为一种 `BaaS` 场景，在过去的一段时间内发展非常的迅猛。

其中里面最受瞩目的功能，自然是云函数了，它作为一种 `Serverless` 落地的场景，很好的开启了小程序开发者连接服务端编程的大门。

当然，作为一个未来具有很大发展前景的项目，对于目前的非 `js` 开发者, 显得不那么友好，虽然可以依托 `云托管` 功能，使用传统静态语言构建服务，但是毕竟开发小程序用的还是 `js` 嘛。

云托管作为一种多语言的解决方案，从文档上看，应该就是预置了并发实例的多线程 docker 容器吧 , 毕竟那些静态语言的启动时间可是远远超出 nodejs 的。

本篇文章主要面向 **云开发** 中的 Nodejs **云函数** 功能

## 云函数原生开发体验的不足

> 开通云开发，设置个 `cloudfunctionRoot` ,  微信开发者工具就自动识别文件夹和里面的目录了。

新建一个云函数可以看到，创建了一个文件夹, 里面有三个文件:
- config.json
- index.js
- package.json

显然这就是一个最小化的 nodejs 项目。

然而当我们上传并部署的时候，会显然发现几个问题：

1. 上传并部署虽然可以云端安装 `node_modules` , 但是当我们要引用一个这个项目外部的公共文件时，那个文件在部署时并不会被上传上去。这就会直接导致报错。(上传并部署只上传文件夹里的东西)
2. `package.json` 中的 `dependencies` , 由于每个云函数都是独立的 `Serverless` 容器 , 导致了一个 `common` 的包(比如 `wx-server-sdk`, `dayjs`,`uuid` 等等)，要在不同的函数里被安装多次。

不得不说，这2个问题，对于整个的开发体验来说，不是很好，不过我们可以自己构建一个 `compile-time` 来改善自己的开发体验。
<!-- 3. 本地调试据我猜测应该是那种 nodejs `Attach to Remote` 的思路 ,  -->

## 从一个前端的角度出发

我们前端经常使用 `webpack` 和 `rollup` 这类的工具。

本文打包用的是 `rollup` , 之前使用它打包过很多的 node 项目 , 当然其它的工具都可以，`Vanilla JS` 当然也可以，见仁见智。

我们在 `cloudfunctions` 目录里 创建 `src` 作为源码目录, `dist` 作为打包后的目录。

```shell
// cd cloudfunctions/
npm init -y
```

然后在里面的 `devDependencies` 安装好 `rollup` 相关的工具链，预置好命令。

### 为了解决第一个不足点：

我把 `src` 下的目录，分为了 **2** 类，
1. 一类是云函数目录
2. 另外一类是公共代码目录

云函数类似原生的写法，而公共函数可以被云函数引用，
这里列举一个改造后的云函数示例：

```js
import cloud from '~/common/cloud'
import { getNowFullDate } from '~/common/util/day.esm'
import { getNanoid } from '~/common/util/nanoid'
export async function main (event, context) {
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    env: wxContext.ENV,
    fullDate: getNowFullDate(),
    nanoid: getNanoid()
  }
}
```
> tip: 用 `alias` 后 , 加个 `jsconfig.json`，给 `vscode` 加智能提示。

这些云函数既可以使用 `cjs` , 也可以使用 `esm` , 并最终通过 `babel` 编译成 Nodejs 10.15 (当前云函数runtime) 可直接运行的代码。
 
打包后，可见 `dist` 对应云函数中，自动打入了依赖的公共代码。

### 为了解决第二个不足点：
<!-- `dependencies`  -->
我把 `package.json` 分为了 **2** 类:
1. `cloudfunctions` 根目录下的 `package.json`
2. `src` 对应函数目录下的 `package.json`

第一类作为所有云函数都依赖的 npm 包(比如 `wx-server-sdk`,`core-js` 这种)

另外一类是那个云函数特定依赖的包。

而最终 `dist` 目录下打包好的所有函数里面都有一个 `package.json`

它的 `dependencies` 由 1.和2. merge 而成，即：

```js
Object.assign({},rootPkgJson.dependencies,targetPkgJson.dependencies)
```

这种写法同时保证了，内部依赖的优先级级别**高于**外部。

同时也有一个好处,不需要再在每个云函数里面都定义一个 `package.json`

如果够懒，甚至所有的运行时依赖，都可以放在外部。

## 另外一些细节

不要忘记 copy `config.json` 到对应 `dist` 对应函数中

同时这种方案由于最终生成的代码，和自个写的有些差距，本地调试啥的，是依赖`source map` 的

## 收尾:
接下来只要小程序编译时，通过 `copy` 的 方案，把它放入小程序的ide中，这样就可以便捷的，切换环境，部署,和调试了。

> 我也尝试了 `symlink` 的方案,把微信 ide 中的 `cloudfunctions` 指向 `dist`,可是发现 ide 会自动做剪切处理。
## 附录：

[方案源码](https://github.com/sonofmagic/a-way-to-improve-wechat-cloudbase-experience)

喜欢的话可以点个 `star` , 点个 `follow` 哟。
