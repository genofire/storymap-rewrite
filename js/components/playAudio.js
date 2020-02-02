import $ from 'jquery'

export function playBing (sceneObject) {
  if (sceneObject.audio !== undefined) {
    const audio = new Audio('./data/audio/Information_Block.ogg')
    audio.play()
    audio.onended = function () {
      playSection(sceneObject)
    }
  }
}

// Design this to be scene specific. State of Audio should be maintained.

export function playSection (sceneObject) {
  // Audio Playback
  const audio = new Audio(sceneObject.audio)
  audio.pause()
  const audioTimes = {}
  let timer
  let percent = 0

  // Audio control
  $('#playAudio').click(function (e) {
    $(this).find('.icon').toggleClass('ion-md-play ion-md-pause')

    if (!audio.paused) {
      audio.pause()
    } else {
      audio.play()
    }
  })

  $(audio).on('playing', function (_event) {
    var duration = _event.target.duration
    advance(duration, audio)
  })

  $(audio).on('pause', function (_event) {
    clearTimeout(timer)
  })

  function advance (duration, element) {
    const progress = $('#audioProgress')[0]
    const increment = 10 / duration
    percent = Math.min(increment * element.currentTime * 10, 100)
    progress.style.width = percent + '%'
    startTimer(duration, element)
  }

  function startTimer (duration, element) {
    if (percent < 100) {
      timer = setTimeout(function () {
        advance(duration, element)
      }, 100)
      if (!(audio.currentSrc in audioTimes) && (audioTimes.currentSrc = {})) {
        audioTimes[audio.currentSrc] = audio.currentTime
        console.log(audio)
        console.log(audioTimes)
      }
    }
  }
}
