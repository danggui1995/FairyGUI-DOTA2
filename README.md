# Basic
关于FGUI的一切信息可以在官网找到。

https://www.fairygui.com/


# Note
1.Dota2平台的Web阉割了一些功能，会导致有些功能无法使用（九宫格图片）。

2.由于dota2平台没有IO接口的特殊性，所有界面数据目前都保存在代码文件中在初始化的时候全部转化成ArrayBuffer。


# Advance
1.所见即所得，不需要再额外编写xml和css文件，自动导出到TypeScript数据绑定，变量名和编辑器中一一对应，可直接使用。

2.跨平台：使用fgui编辑器编写的所有界面，可以无缝迁移到其他各引擎。

3.增加了文本的垂直方向对齐。

4.修复一些富文本的原生bug。

5.不用再针对不同的分辨率单独设计css，通过关联，可以省去dota2适配不同分辨率的繁琐操作。

6.扩展dota2的原生组件：技能图标，物品图标，玩家头像，模型，特效等。


# Powered By
<img src="https://resources.jetbrains.com/storage/products/company/brand/logos/Rider_icon.png" alt="Rider logo." width=128px>
<img src="https://resources.jetbrains.com/storage/products/company/brand/logos/Rider.png" alt="Rider logo." width=256px>