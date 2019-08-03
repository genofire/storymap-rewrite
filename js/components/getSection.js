import $ from 'jquery'

export function getSection (sections, targetScene) {
  $.each(sections, function (key, element) {
    const section = $(element)
    // Keep for Development
    // const sectionContent = $(element).children('.section-content')
    if (section[0].dataset.scene !== targetScene) {
      section.trigger('notviewing')
    } else {
      section.trigger('viewing')
    };
  })
}
