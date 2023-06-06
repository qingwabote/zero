#pragma once

#include <thread>
#include "ThreadSafeQueue.hpp"
#include "base/UniqueFunction.hpp"
#include "base/TaskRunner.hpp"

class ThreadPool : public TaskRunner
{
private:
    bool _threadsCreated = false;

    std::atomic<bool> _running{true};

    std::vector<std::unique_ptr<std::thread>> _threads;

    ThreadSafeQueue<UniqueFunction> _functionQueue;

public:
    static ThreadPool &shared();

    ThreadPool(uint32_t size);

    void post(UniqueFunction &&func) override;

    void join();

    ~ThreadPool();
};
