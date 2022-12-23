#include "ThreadPool.hpp"

ThreadPool &ThreadPool::instance()
{
    static ThreadPool instance(1);
    return instance;
}

ThreadPool::ThreadPool(uint32_t size)
{
    _threads.resize(size);
}

void ThreadPool::run(UniqueFunction &&func)
{
    _functionQueue.push(std::forward<UniqueFunction>(func));

    if (!_threadsCreated)
    {
        for (size_t i = 0; i < _threads.size(); i++)
        {
            _threads[i] = std::make_unique<std::thread>(
                [this]()
                {
                    while (!_isTerminated)
                    {
                        auto functionQueue = _functionQueue.flush(true);
                        for (auto &func : functionQueue)
                        {
                            func();
                        }
                    }
                });
        }
        _threadsCreated = true;
    }
}

ThreadPool::~ThreadPool()
{
    _isTerminated = true;
    _functionQueue.unblock();
    for (size_t i = 0; i < _threads.size(); i++)
    {
        _threads[i]->join();
    }
}