add_library(v8 SHARED IMPORTED GLOBAL)
set_target_properties(v8 PROPERTIES
  INTERFACE_COMPILE_DEFINITIONS V8_COMPRESS_POINTERS

  INTERFACE_INCLUDE_DIRECTORIES ${CMAKE_CURRENT_LIST_DIR}/include

  IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/x64/v8.dll
  IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/x64/v8.dll.lib
)

add_library(v8_libbase SHARED IMPORTED GLOBAL)
set_target_properties(v8_libbase PROPERTIES
  IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/x64/v8_libbase.dll
  IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/x64/v8_libbase.dll.lib
)

add_library(v8_libplatform SHARED IMPORTED GLOBAL)
set_target_properties(v8_libplatform PROPERTIES
  IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/x64/v8_libplatform.dll
  IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/x64/v8_libplatform.dll.lib
)

target_link_libraries(v8 INTERFACE v8_libbase v8_libplatform)

# target_link_libraries(v8 INTERFACE winmm.lib)
# target_link_libraries(v8 INTERFACE dbghelp.lib)

if(MSVC)
    file(GLOB_RECURSE WIN32_DLLS
        ${CMAKE_CURRENT_LIST_DIR}/libs/x64/*.dll
    )
    set(WIN32_DLLS ${WIN32_DLLS} PARENT_SCOPE)
endif()