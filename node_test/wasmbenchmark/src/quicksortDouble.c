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

EM_PORT_API(void) quicksortDouble(double *array, int start, int end) {
  if (start >= end) return;
  double pivot = array[end];
  int left = 0;
  int right = 0;
  while (left + right < end - start) {
    double num = array[start+left];
    if (num < pivot) {
      left++;
    } else {
      array[start+left] = array[end-right-1];
      array[end-right-1] = pivot;
      array[end-right] = num;
      right++;
    }
  }
  quicksortDouble(array, start, start+left-1);
  quicksortDouble(array, start+left+1, end);
}
