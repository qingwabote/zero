#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class Semaphore_impl;

        class Semaphore : public Binding
        {
        private:
            std::unique_ptr<Semaphore_impl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Semaphore_impl &impl() { return *_impl.get(); }

            Semaphore(std::unique_ptr<Semaphore_impl> impl);

            bool initialize();

            ~Semaphore();
        };
    }
}