#pragma once

struct float4
{
    float data[4];

    float &operator[](int i)
    {
        return data[i];
    }
};

void copy(float4 &out, float4 &a);
void slerp(float4 &out, float4 &a, float4 &b, float t);