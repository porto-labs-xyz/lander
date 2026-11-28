export function oneHardwareSections(rearImage, rearControls) {
  return `<section class="section specifications" id="inside-one" aria-labelledby="inside-one-title">
  <div class="section-head"><h2 id="inside-one-title">In The Kiln.</h2><span class="meta">engineering targets / in development</span></div>
  <figure class="one-hardware-view">
    <a href="/assets/kiln/one-interior-charcoal-cutout.webp" aria-label="View the two-GPU interior at full size">
      <img src="/assets/kiln/one-interior-charcoal-cutout.webp" width="1206" height="1104" alt="Kiln One with a deep charcoal outer shell and the side panel removed, showing two NVIDIA RTX PRO 6000 Blackwell Workstation Edition cards." loading="lazy" decoding="async">
    </a>
    <figcaption>
      <h3>Keep it brief</h3>
      <p>A proposed two-GPU configuration for local creative workloads. Generation speed, offline operation and dual-GPU scheduling still require validation.</p>
    </figcaption>
  </figure>
</section>
<section class="section specifications" id="kiln-rear" aria-labelledby="kiln-rear-title">
  <div class="section-head"><h2 id="kiln-rear-title">Kiln Rear.</h2><span class="meta">connectivity engineering targets</span></div>
  <figure class="one-hardware-view" data-rear-gallery>
    ${rearImage}
    <figcaption>
      ${rearControls}
      <p class="rear-panel-caption">Kiln Rear as a front panel, for fast switching, aesthetic stays.</p>
      <h3 id="back">Massive Connectivity For Ambitious Studios</h3>
      <p>8 HDMI displays via DisplayPort adapters<br>3 USB-C (Thunderbolt 5) · 4 USB-A<br>2 × 10 GbE (RJ45) · 2 × 400 GbE (QSFP112)<br>2.2 kW power supply</p>
    </figcaption>
  </figure>
  <dl class="spec-grid">
    <div><dt>Graphics target</dt><dd>NVIDIA RTX PRO 6000</dd></div>
    <div><dt>GPU memory</dt><dd>96 GB per GPU</dd></div>
    <div><dt>GPU capacity</dt><dd>1 GPU, expandable to 2</dd></div>
    <div><dt>System memory</dt><dd>128 GB</dd></div>
    <div><dt>Storage</dt><dd>4 TB</dd></div>
    <div><dt>Dimensions target</dt><dd>250 × 450 × 460 mm</dd></div>
  </dl>
  <p class="fine">All specifications are engineering targets, subject to validation. Chassis fit, cooling, power integration, simultaneous bandwidth and eight-display operation have not been validated. GPU memory is per card; pooling requires compatible software. Rendered components are illustrative.</p>
</section>`
}
