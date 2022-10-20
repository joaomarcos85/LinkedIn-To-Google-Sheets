var LinkedIn = function () {
  function getCurrentQuestions() {
    const questionElements = Array.from(document.querySelectorAll('.hiring-screening-question-list__list-item .t-bold'));
    const answers = questionElements.map((questionElement) => {
      const question = questionElement.parentElement.querySelector('p').innerText.replace(/\n/g, '').trim();
      const answer = questionElement.innerText.replaceAll('Resposta da pessoa candidata\n', '').replace(/\n/g, '').trim();
      return {
        question,
        answer
      }
    })

    return answers;
  }

  function getCurrentCandidateName() {
    const name = document.querySelector('h1.display-flex.align-items-center.t-24').
      childNodes[0].wholeText.replaceAll('Candidatura de ', '').trim();
    return name;
  }

  async function getCurrentCandidateEmail() {
    try {
      if (!document.querySelector('.hiring-applicant-header.artdeco-card.p0 [href^="mailto:"]')) {
        document.querySelector('.hiring-applicant-header.artdeco-card.p0 .hiring-applicant-header-actions .artdeco-dropdown.artdeco-dropdown--placement-bottom.artdeco-dropdown--justification-left.ember-view.ml1.mt3.flex-shrink-zero button').click()
      }
      await waitForElement('.hiring-applicant-header.artdeco-card.p0 [href^="mailto:"]');
      const mailTo = document.querySelector('.hiring-applicant-header.artdeco-card.p0 [href^="mailto:"]').href;
      if (!mailTo) {
        return "";
      }
      const email = mailTo.match(/(?<=mailto:)(.+)(?=\?)/g);
      if (!email || !Array.isArray(email) || email.length == 0) {
        return "";
      }
      return email[0];
    } catch (error) {
      return "";
    }
  }

  async function getCurrentCandidatePhone() {
    try {
      if (!document.querySelector('.ember-view.hiring-applicant-header-actions__dropdown-content [type="phone-handset"]')) {
        document.querySelector('.hiring-applicant-header.artdeco-card.p0 .hiring-applicant-header-actions .artdeco-dropdown.artdeco-dropdown--placement-bottom.artdeco-dropdown--justification-left.ember-view.ml1.mt3.flex-shrink-zero button').click()
      }
      await waitForElement('.ember-view.hiring-applicant-header-actions__dropdown-content [type="phone-handset"]');
      const phoneElement = document.querySelector('.ember-view.hiring-applicant-header-actions__dropdown-content [type="phone-handset"]').
        parentElement.querySelector('.hiring-applicant-header-actions__more-content-dropdown-item-text');
      return phoneElement.innerText
    } catch (error) {
      return "";
    }
  }

  async function getCurrentCandidateResumeLink() {
    try {
      let linkElement = document.querySelector('.hiring-resume-viewer__resume-wrapper--collapsed a');
      if (!linkElement) {
        linkElement = document.querySelector('.ui-attachment.ui-attachment--doc a')
      }
      return linkElement.href;
    } catch (error) {
      return "";
    }
  }

  function waitForElement(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  async function getCurrentCandidateInfo() {
    const name = getCurrentCandidateName();
    const email = await getCurrentCandidateEmail();
    const phone = await getCurrentCandidatePhone();
    const resumeLink = await getCurrentCandidateResumeLink();
    const questions = getCurrentQuestions();
    return {
      name,
      email,
      phone,
      resumeLink,
      questions
    }
  }

  return {
    getCurrentCandidateInfo
  }

}();