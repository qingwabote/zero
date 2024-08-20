为了解决 SWIG 的几个问题：
- [总是返回新的 JS 对象](https://qingwabote.github.io/ink/#/cpp/swig?id=总是返回新的-js-对象)
- [对智能指针的支持并不完整](https://qingwabote.github.io/ink/#/cpp/swig?id=对智能指针的支持并不完整)

对 SWIG 做了修改，所以需要使用 Lib\javascript\v8 下面的文件替换掉 SWIG（我这里是 swigwin-x.x.x）对应目录的文件

新建目录 auto, 然后生成绑定：
```ps
cd .\native\main\swig
swig -c++ -javascript -v8 -IC:\Users\logan\Documents\GitHub\zero\native\main -o .\auto\ImageBitmap_wrap.cpp ImageBitmap.i
swig -c++ -javascript -v8 -IC:\Users\logan\Documents\GitHub\zero\native\main -o .\auto\Loader_wrap.cpp Loader.i
swig -c++ -javascript -v8 -IC:\Users\logan\Documents\GitHub\zero\native\main -o .\auto\gfx_wrap.cpp gfx.i
swig -c++ -javascript -v8 -IC:\Users\logan\Documents\GitHub\zero\native\main -o .\auto\Window_wrap.cpp Window.i
```
*swig -I<这里不支持相对路径>😭*

*swigwin-4.1.1*
