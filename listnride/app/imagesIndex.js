const ctx = require.context('./assets', true, /\.(png|svg|jpg|jpeg|gif)$/);

ctx.keys().forEach(ctx);
