<script>
    import { Player, Hls, Settings } from '@vime/svelte';
    export let stream = 'localhost:3000';
    export let width = 640;
    export let height = 480;
</script>

<div class="player">
    <Player aspectRatio="4:3">
        <Hls version="latest">
            <source data-src="http://{stream}/master.m3u8">
        </Hls>
    </Player>
</div>
