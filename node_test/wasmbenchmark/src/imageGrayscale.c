#ifndef EM_PORT_API
#	if defined(__EMSCRIPTEN__)
#		include <emscripten.h>
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#		else
#			define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#		endif
#	else
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype
#		else
#			define EM_PORT_API(rettype) rettype
#		endif
#	endif
#endif

EM_PORT_API(void) imageGrayscale(unsigned char *data, int width, int height) {
  for (int i = 0, il = width * height; i < il; i++) {
    unsigned char r = data[i*4+0];
    unsigned char g = data[i*4+1];
    unsigned char b = data[i*4+2];
    data[i*4+0] = data[i*4+1] = data[i*4+2] =
      0.2126*r + 0.7152*g + 0.0722*b;
  }
}
