#include "ThreadPool.hpp"

ThreadPool &ThreadPool::shared()
{
    static ThreadPool shared{3};
    return shared;
}

ThreadPool::ThreadPool(uint32_t size)
{
    _threads.resize(size);
}

void ThreadPool::post(std::unique_ptr<bastard::Lambda<void>> &&callable)
{
    _functionQueue.push(std::move(callable));

    if (!_threadsCreated)
    {
        for (size_t i = 0; i < _threads.size(); i++)
        {
            _threads[i] = std::make_unique<std::thread>(
                [this]()
                {
                    std::unique_ptr<bastard::Lambda<void>> f{};
                    while (_running.load(std::memory_order_relaxed))
                    {
                        _functionQueue.pop(f, true);
                        f->call();
                    }
                });
        }
        _threadsCreated = true;
    }
}

void ThreadPool::join()
{
    _running.store(false, std::memory_order_relaxed);
    for (size_t i = 0; i < _threads.size(); i++)
    {
        // wake the blocked threads up
        post([]()
             {
                 // do nothing
             });
    }
    for (size_t i = 0; i < _threads.size(); i++)
    {
        _threads[i]->join();
    }
}

ThreadPool::~ThreadPool()
{
    if (_running.load(std::memory_order_relaxed))
    {
        join();
    }
}
