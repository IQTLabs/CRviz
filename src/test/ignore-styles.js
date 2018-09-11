function ignore() {
  return null;
}

require.extensions['.css'] = ignore;
require.extensions['.less'] = ignore;
require.extensions['.scss'] = ignore;