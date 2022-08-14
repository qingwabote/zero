#pragma once

class Device
{
private:
    Device(/* args */);
    ~Device();

public:
    static Device *instance();

    bool initialize();
};
