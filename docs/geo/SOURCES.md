# 地理数据来源

本目录 GeoJSON 来自日内瓦州官方 SITG（Système d'information du territoire à Genève），非手绘。

| 文件 | 来源服务 | 说明 |
|------|----------|------|
| `communes-ch.geojson` | [CAD_COMMUNE](https://sitg.ge.ch/donnees/cad-commune) | 日内瓦州市镇边界（裁剪至 CERN 周边 bbox） |
| `communes-fr.geojson` | [GEO_COMMUNES_CH_FR](https://sitg.ge.ch) | 法瑞跨境市镇（Ain / Haute-Savoie，同 bbox） |
| `lac-leman.geojson` | GEO_LAC_LEMAN | 日内瓦湖水面（同 bbox） |

- 坐标系：WGS84 (EPSG:4326)
- 裁剪范围：约 5.96°E–6.22°E，46.16°N–46.32°N
- 几何简化：`maxAllowableOffset=0.0008`（ArcGIS 服务端）
- 许可：© SITG / État de Genève
