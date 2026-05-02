Improve WebP export reliability and compression feedback.

- Ensure WebP exports use real WebP bytes across single-file and ZIP export paths.
- Fix the `None` compression summary so it shows exported file size and time instead of a compression ratio.
- Compare compressed results against the same-format `None` baseline, so WebP compression is compared with WebP instead of the intermediate PNG export.
- Prevent compressed exports from becoming larger: when compression produces a bigger file, the plugin exports the same-format `None` result and reports `0.0%`.
- Replace `Append Suffix` with `Disable Suffix`. Suffixes are now enabled by default and reflect the actual exported result.

改进 WebP 导出可靠性和压缩反馈。

- 确保单文件导出和 ZIP 导出路径都输出真实 WebP 字节。
- 修复 `None` 压缩时的结果展示：只显示实际导出文件大小和耗时，不再显示压缩比例。
- 压缩结果现在会和同格式的 `None` 基准对比；WebP 压缩会和 WebP 基准对比，不再和中间 PNG 对比。
- 避免压缩后文件反而变大：如果压缩结果更大，插件会实际导出同格式 `None` 结果，并显示 `0.0%`。
- 将 `Append Suffix` 改为 `Disable Suffix`。现在默认添加后缀，且后缀会根据实际导出的结果生成。
