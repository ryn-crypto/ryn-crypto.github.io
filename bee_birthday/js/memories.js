$(function () {
  $("#dowebok").fullpage({
    navigation: true,
    navigationPosition: "left",
    navigationColor: ["#fff"],
  });

  document.body.addEventListener("mousemove", function () {
    // audio.play();
    var vid = $("audio")[0];
    vid.muted = false;
    $("audio")[0].play();
    // console.log(test);
    console.log($("audio")[0]);
  });
});
// loadAudioFile("../music/2.mp3");
