<script>
  export let lastChecked = Date.now();
  export let lastInfo = checkPlant();

  async function checkPlant() {
      let info = JSON.parse(await fetch(`http://localhost:3000/info`).then(r => r.text()));
      lastChecked = Date.now();
      return info;
  }

  async function update() {
      lastInfo = {
          light: undefined,
          water: undefined,
          temperature: undefined,
      }
      lastInfo = await checkPlant();
      console.log(lastInfo);
  }

  update();
  setInterval(update, 5 * 60 * 1000);
</script>

<div class="info">
    <br>
    <hr>
    <ul>
        <li>Light (0 to 100): {lastInfo.light === undefined ? "loading..." : lastInfo.light}</li>
        <li>Moisture (soil to water): {lastInfo.water === undefined ? "loading..." : lastInfo.water}</li>
        <li>Temperature (C): {lastInfo.temperature === undefined ? "loading..." : lastInfo.temperature}</li>
    </ul>
    <hr>
    <p>Last checked at {(() => {
        const date = new Date(lastChecked);
        return date.toLocaleString();
    })()}<br>(updates every 5 minutes)</p>

    <button on:click={update}>Update</button>
</div>


<style>
  .info {
    list-style: none;
    padding: 0;
  }
</style>