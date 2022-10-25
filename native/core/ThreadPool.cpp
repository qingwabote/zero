#include "ThreadPool.hpp"

ThreadSafeQueue<UniqueFunction> ThreadPool::_functionQueue;

ThreadPool &ThreadPool::instance()
{
    static ThreadPool instance(1);
    return instance;
}

ThreadPool::ThreadPool(uint32_t size)
{
}

void ThreadPool::run(UniqueFunction &&func)
{
    _functionQueue.push(std::forward<UniqueFunction>(func));

    if (!_threadsCreated)
    {
        auto t = std::thread(
            []()
            {
                while (true)
                {
                    auto functionQueue = _functionQueue.flush(true);
                    for (auto &func : functionQueue)
                    {
                        func();
                    }
                }
            });
        t.detach();
        _threadsCreated = true;
    }
}

ThreadPool::~ThreadPool()
{
}