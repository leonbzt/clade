<script lang="ts">
  import { PALETTE as P } from '../data/view';

  let { x, y, scale = 1 }: { x: number; y: number; scale?: number } = $props();
</script>

<g transform="translate({x} {y}) scale({scale})" class="steam" pointer-events="none">
  <circle r="3" fill="#e0a070" opacity="0.6" />
  {#each [0, 1, 2, 3] as i (i)}
    <circle class="puff" r="5" fill={P.steam} style="animation-delay: {i * -0.9}s" />
  {/each}
</g>

<style>
  .puff {
    opacity: 0;
    animation: rise 3.6s ease-out infinite;
  }
  @keyframes rise {
    0% {
      transform: translate(0, 0) scale(0.4);
      opacity: 0.55;
    }
    100% {
      transform: translate(6px, -38px) scale(2.2);
      opacity: 0;
    }
  }
</style>
