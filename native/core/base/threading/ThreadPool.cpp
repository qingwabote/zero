#include "ThreadPool.hpp"

ThreadPool &ThreadPool::shared()
{
    static ThreadPool shared{1};
    return shared;
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
                    while (_running)
                    {
                        // auto functionQueue = _functionQueue.flush(true);
                        // for (auto &func : functionQueue)
                        // {
                        //     func();
                        // }
                        UniqueFunction f{};
                        _functionQueue.pop(f, true);
                        f();
                    }
                });
        }
        _threadsCreated = true;
    }
}

void ThreadPool::join()
{
    _running = false;
    for (size_t i = 0; i < _threads.size(); i++)
    {
        auto f = new auto(
            [=]()
            {
                // do nothing
            });
        _functionQueue.push(UniqueFunction::create<decltype(f)>(f)); // wake the blocked threads up
    }
    for (size_t i = 0; i < _threads.size(); i++)
    {
        _threads[i]->join();
    }
}

ThreadPool::~ThreadPool()
{
    if (_running)
    {
        join();
    }
}
