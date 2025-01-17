#include <emscripten/bind.h>

using namespace emscripten;

class MyOtherClass
{
public:
    int getY()
    {
        return 6;
    }
};

class MyClass
{
private:
    MyOtherClass _other;

public:
    MyClass(int x, std::string y)
        : x(x), y(y)
    {
    }

    MyOtherClass *getOther()
    {
        return &_other;
    }

    void incrementX()
    {
        ++x;
    }

    int getX() const { return x; }
    void setX(int x_) { x = x_; }

    static std::string getStringFromInstance(const MyClass &instance)
    {
        return instance.y;
    }

private:
    int x;
    std::string y;
};

// Binding code
EMSCRIPTEN_BINDINGS(my_class_example)
{
    class_<MyOtherClass>("MyOtherClass")
        .constructor<>()
        .function("getY", &MyOtherClass::getY);

    class_<MyClass>("MyClass")
        .constructor<int, std::string>()
        .function("getOther", &MyClass::getOther, return_value_policy::reference())
        .function("incrementX", &MyClass::incrementX)
        .property("x", &MyClass::getX, &MyClass::setX)
        .property("x_readonly", &MyClass::getX)
        .class_function("getStringFromInstance", &MyClass::getStringFromInstance);
}