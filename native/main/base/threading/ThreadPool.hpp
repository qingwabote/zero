#pragma once

#include <thread>
#include "ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"

class ThreadPool : public TaskRunner
{
private:
    bool _threadsCreated = false;

    std::atomic<bool> _running{true};

    std::vector<std::unique_ptr<std::thread>> _threads;

    ThreadSafeQueue<std::unique_ptr<callable::Callable<void>>> _functionQueue;

protected:
    void post(std::unique_ptr<callable::Callable<void>> &&callable) override;

public:
    static ThreadPool &shared();

    ThreadPool(uint32_t size);

    using TaskRunner::post;

    void join();

    ~ThreadPool();
};
