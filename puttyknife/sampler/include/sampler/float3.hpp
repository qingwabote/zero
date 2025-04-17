#pragma once

struct float3
{
    float data[3];

    float &operator[](int i)
    {
        return data[i];
    }
};

void set(float3 &out, float x, float y, float z);
void copy(float3 &out, float3 &a);
void lerp(float3 &out, float3 &a, float3 &b, float t);
