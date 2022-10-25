#pragma once

#include "ThreadSafeQueue.hpp"
#include "UniqueFunction.hpp"

class ThreadPool
{
private:
    static ThreadSafeQueue<UniqueFunction> _functionQueue;

    bool _threadsCreated = false;

public:
    static ThreadPool &instance();

    ThreadPool(uint32_t size);

    void run(UniqueFunction &&func);

    ~ThreadPool();
};
