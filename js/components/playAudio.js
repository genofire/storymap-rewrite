import $ from 'jquery'

const scenesAudio = {}

export function playBing (scenesObject, sceneKey, sceneObject) {
  if (sceneObject.audio !== undefined) {
    const audio = new Audio('./data/audio/Information_Block.ogg')
    audio.play()
    audio.onended = function () {
      playSection(scenesObject, sceneKey)
    }
  }
}

// Design this to be scene specific. State of Audio should be maintained.

export function playSection (scenesObject, sceneKey) {
  // Audio Playback
  let timer
  let percent = 0

  let audio = scenesAudio[sceneKey]
  if (!audio) {
    const sceneObj = scenesObject[sceneKey]
    if (!sceneObj) {
      console.log('scene not find during load audio')
      return
    }
    audio = new Audio(sceneObj.audio)
    scenesAudio[sceneKey] = audio
  }

  // Audio control
  $('#playAudio').off('click').click(function (e) {
    $(this).find('.icon').toggleClass('ion-md-play ion-md-pause')

    if (!audio.paused) {
      audio.pause()
      console.log(audio)
    } else {
      audio.play()
      console.log(audio)
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
    }
  }
}
