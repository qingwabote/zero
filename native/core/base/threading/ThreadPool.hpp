#pragma once

#include "ThreadSafeQueue.hpp"
#include "base/UniqueFunction.hpp"

class ThreadPool
{
private:
    bool _threadsCreated = false;

    std::atomic<bool> _isTerminated{false};

    std::vector<std::unique_ptr<std::thread>> _threads;

    ThreadSafeQueue<UniqueFunction> _functionQueue;

public:
    static ThreadPool &instance();

    ThreadPool(uint32_t size);

    void run(UniqueFunction &&func);

    ~ThreadPool();
};
