#include "websockets.hpp"
#include "lws/libwebsockets.h"

namespace
{
    struct per_session_data
    {
        per_session_data *pss_list{nullptr};
        lws *wsi{nullptr};
    };

    int callback(lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len)
    {
        return 0;
    }

    lws_protocols protocols[] = {
        {"", callback, sizeof(per_session_data), 128, 0, NULL, 0},
        LWS_PROTOCOL_LIST_TERM};
}

namespace tests::websockets
{
    int server()
    {
        lws_context_creation_info info{};
        info.port = 7681;
        info.protocols = protocols;

        lws_context *context = lws_create_context(&info);
        if (!context)
        {
            return 1;
        }

        while (lws_service(context, 0) >= 0)
        {
        }

        return 0;
    }
}