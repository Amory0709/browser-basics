(function () {
  const SLB = { blue: '#0014dc', navy: '#003366' };
  const MAP = { w: 720, h: 480, pad: 28 };

  const MAX_ICONS = 24;
  const CELL = 13;

  const sites = [
    {
      name: 'Building 513 · Computer Centre', region: 'Meyrin · 瑞士侧',
      lon: 6.05351, lat: 46.23377,
      groups: [
        { type: 'mainframe', count: 20, label: 'IBM VM/CMS', detail: '~20 CU；~60 GB 用户盘 [1]' },
        { type: 'vax', count: 2, label: 'VXCRNA + VXCRNB', detail: '8650 + 8800；~4.5 CU [1]' },
        { type: 'pc', count: 136, label: 'Index 终端线', detail: '72+64 条 Index 线 [1]' },
      ],
    },
    {
      name: 'Building 31', region: 'Meyrin · Tim BL',
      lon: 6.0568, lat: 46.2317,
      groups: [{ type: 'next', count: 1, label: 'NeXT', detail: '1989 提案；1990 WWW [2]' }],
    },
    {
      name: 'Meyrin SCR', region: '技术/安全控制',
      lon: 6.0518, lat: 46.2352,
      groups: [{ type: 'pc', count: 50, label: 'LEP 报警系统', detail: '50+ 计算机 [5]' }],
    },
    {
      name: 'Prévessin PCR', region: '法国侧 · 控制室',
      lon: 6.0120, lat: 46.2720,
      groups: [
        { type: 'workstation', count: 12, label: 'Apollo 工作站', detail: 'LEP/SPS 控制台 [4]' },
        { type: 'pc', count: 56, label: '386 前端 PC', detail: '1989.7 首束流 [4][6]' },
      ],
    },
    {
      name: 'LEP Point 1', region: '环上 · Meyrin',
      lon: 6.0582, lat: 46.2361,
      groups: [{ type: 'workstation', count: 30, label: 'ALEPH 等实验集群', detail: '数据重建 [3]' }],
    },
    {
      name: 'LEP Point 2 · Sergy', region: '环上 · 法国',
      lon: 6.0407, lat: 46.2503,
      groups: [{ type: 'pc', count: 25, label: 'DELPHI / L3 区域', detail: 'Token Ring [4]' }],
    },
    {
      name: '欧洲 institute', region: 'FATMEN 分布式',
      lon: 6.1437, lat: 46.2044,
      groups: [{ type: 'vax', count: 80, label: '跨所协作节点', detail: '10+ OS 变种 [3]' }],
    },
  ];

  function showMapError(message) {
    const map = document.getElementById('map');
    if (!map) return;
    map.innerHTML =
      `<text x="360" y="240" text-anchor="middle" class="map-status">地图加载失败：${message}</text>`;
  }

  function gridPositions(n) {
    const cols = Math.min(n, Math.ceil(Math.sqrt(n)));
    const out = [];
    for (let i = 0; i < n; i += 1) {
      out.push({ x: (i % cols) * CELL, y: Math.floor(i / cols) * CELL });
    }
    return out;
  }

  function drawIcon(g, type) {
    const icons = {
      mainframe: () => {
        g.append('rect').attr('x', -5).attr('y', -3).attr('width', 10).attr('height', 6).attr('rx', 0.5).attr('fill', SLB.blue);
        g.append('rect').attr('x', -4).attr('y', -1.5).attr('width', 8).attr('height', 1).attr('fill', '#eef4ff');
      },
      vax: () => {
        g.append('rect').attr('x', -2.5).attr('y', -5).attr('width', 5).attr('height', 10).attr('rx', 0.5).attr('fill', SLB.navy);
      },
      workstation: () => {
        g.append('rect').attr('x', -3).attr('y', 0).attr('width', 4).attr('height', 3).attr('fill', '#64748b');
        g.append('rect').attr('x', 0).attr('y', -4).attr('width', 5).attr('height', 3.5).attr('rx', 0.5).attr('fill', '#94a3b8');
      },
      pc: () => {
        g.append('rect').attr('x', -4).attr('y', -1).attr('width', 2.5).attr('height', 4).attr('fill', '#475569');
        g.append('rect').attr('x', -1).attr('y', -3).attr('width', 5).attr('height', 3.5).attr('fill', '#64748b');
      },
      next: () => {
        g.append('rect').attr('x', -3).attr('y', -3).attr('width', 6).attr('height', 6).attr('fill', '#0f172a');
      },
    };
    (icons[type] || icons.pc)();
  }

  function initMap() {
    const d3 = window.d3;
    const svg = d3.select('#map');
    svg.selectAll('*').remove();

    if (!window.CERN_GEO) {
      throw new Error('geo/bundle.js 未加载');
    }

    const { ch, fr, lake } = window.CERN_GEO;

    const allFeatures = [
      ...ch.features.map((f) => ({ ...f, country: 'ch' })),
      ...fr.features.map((f) => ({ ...f, country: 'fr' })),
    ];

    const geo = {
      type: 'FeatureCollection',
      features: allFeatures,
    };

    const projection = d3.geoMercator().fitExtent(
      [[MAP.pad, MAP.pad], [MAP.w - MAP.pad, MAP.h - MAP.pad]],
      geo
    );
    const path = d3.geoPath(projection);
    const gMap = svg.append('g');
    const detail = d3.select('#detail');

    function showDetail(d) {
      detail.html(
        `<h3>${d.label}</h3>` +
        `<div class="meta">${d.site} · ${d.region}</div>` +
        `<p><strong>数量：</strong>${d.count}<br>${d.detail}</p>`
      );
    }

    gMap.selectAll('path.commune')
      .data(allFeatures)
      .join('path')
      .attr('class', (d) => `commune ${d.country}`)
      .attr('d', path);

    gMap.selectAll('path.lake')
      .data(lake.features)
      .join('path')
      .attr('class', 'lake')
      .attr('d', path);

    gMap.append('text').attr('class', 'region-label')
      .attr('transform', `translate(${projection([6.05, 46.245])})`)
      .attr('text-anchor', 'middle').attr('dy', -6)
      .text('瑞士 · Meyrin');

    gMap.append('text').attr('class', 'region-label')
      .attr('transform', `translate(${projection([6.03, 46.275])})`)
      .attr('text-anchor', 'middle').attr('dy', -6)
      .text('法国 · Prévessin');

    gMap.append('text').attr('class', 'region-sub')
      .attr('transform', `translate(${projection([6.15, 46.22])})`)
      .attr('text-anchor', 'middle')
      .text('日内瓦湖 · SITG');

    sites.forEach((site) => {
      const [x, y] = projection([site.lon, site.lat]);
      const siteG = gMap.append('g').attr('transform', `translate(${x},${y})`);

      siteG.append('text')
        .attr('x', 0).attr('y', -8)
        .attr('class', 'region-sub')
        .attr('text-anchor', 'middle')
        .text(site.name.split(' · ')[0]);

      let offsetY = 0;

      site.groups.forEach((group) => {
        const shown = Math.min(group.count, MAX_ICONS);
        const positions = gridPositions(shown);
        const cols = Math.min(shown, Math.ceil(Math.sqrt(shown)));
        const rows = Math.ceil(shown / cols);
        const groupW = cols * CELL;
        const groupH = rows * CELL;

        const groupG = siteG.append('g').attr('transform', `translate(${-groupW / 2}, ${offsetY})`);

        positions.forEach((pos) => {
          const icon = groupG.append('g')
            .attr('class', 'marker')
            .attr('transform', `translate(${pos.x + 6}, ${pos.y + 6})`)
            .datum({ ...group, site: site.name, region: site.region });

          drawIcon(icon, group.type);

          icon.on('mouseenter', function (_, d) {
            d3.selectAll('.marker').classed('active', false);
            d3.select(this).classed('active', true);
            showDetail(d);
          });
        });

        if (group.count > MAX_ICONS) {
          groupG.append('text')
            .attr('x', groupW / 2)
            .attr('y', groupH + 12)
            .attr('text-anchor', 'middle')
            .attr('fill', SLB.blue)
            .attr('font-size', 10)
            .attr('font-weight', 600)
            .text(`×${group.count}`);
        }

        offsetY += groupH + (group.count > MAX_ICONS ? 18 : 10);
      });
    });
  }

  function boot(attempts) {
    if (typeof window.d3 === 'undefined' || !window.CERN_GEO) {
      if (attempts > 240) {
        showMapError('依赖脚本未就绪（d3 或 geo/bundle.js）');
        return;
      }
      setTimeout(() => boot(attempts + 1), 25);
      return;
    }
    try {
      initMap();
    } catch (err) {
      showMapError(err.message);
    }
  }

  boot(0);
})();
