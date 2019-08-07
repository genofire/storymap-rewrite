import $ from 'jquery'

export function getSection (sections, targetSceneKey) {
  $.each(sections, function (key, element) {
    const section = $(element)
    if (section[0].dataset.scene !== targetSceneKey) {
      section.trigger('notviewing')
    } else {
      section.trigger('viewing')
    };
  })
}
