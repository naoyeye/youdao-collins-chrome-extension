// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Audio from './audio'
import icons from './icons'
import Tips from './tips'
import { mainBG, fontS, gapL, gapM, gapS, colorDanger,
  colorMuted, colorWarning, colorPrimary } from './style'

import type {
  ChoiceResponseType, ExplainResponseType,
  NonCollinsExplainsResponseType, MachineTranslationResponseType,
  SynonymsType,
} from '../parse'

const SMALL_FONT = 12

const styles = {
  container: {
    transform: 'matrix(1, 0, 0, 1, 1, 1)',
    position: 'relative',
  },
  synonymsContainer: {
    marginTop: gapS,
    fontSize: SMALL_FONT,
  },
  errorP: {
    fontSize: SMALL_FONT,
    margin: `0 0 ${gapS}px 0`,
  },
  link: {
    fontSize: SMALL_FONT,
    color: colorPrimary,
    cursor: 'pointer',
  },
  info: {
    marginBottom: gapL,
  },
  infoItem: {
    marginRight: gapL,
  },
  wordType: {
    fontSize: fontS,
    marginRight: gapS,
    color: colorMuted,
  },
  meaningItem: {
    marginBottom: gapL,
  },
  explain: {
    padding: gapS,
    backgroundColor: mainBG,
  },
  exampleItem: {
    marginTop: gapM,
    paddingLeft: 20,
  },
  star: {
    width: 14,
    height: 14,
    verticalAlign: 'top',
    position: 'relative',
    top: 3,
  },
  choiceItem: {
    backgroundColor: mainBG,
    padding: gapS,
    marginBottom: gapM,
  },
  nonCollinsTips: {
    marginTop: gapS,
    marginBottom: gapM,
  },
  warnItems: {
    backgroundColor: colorWarning,
    marginBottom: gapM,
    paddingLeft: 10,
    color: '#FFF',
  },
}

function renderSentence(sentence) {
  return (
    // eslint-disable-next-line
    <span dangerouslySetInnerHTML={{ __html: sentence }} />
  )
}

function renderFrequence(frequence) {
  return (
    <div style={{ display: 'inline', verticalAlign: 'top' }}>
      {[...Array(frequence).keys()].map((_, index) => (
        <img
          key={index}
          src={icons.star}
          style={styles.star}
          alt="star"
        />
      ))}
    </div>
  )
}

function renderMeaning(meaning, index) {
  const {
    example: { eng, ch },
    explain: { type, typeDesc, engExplain },
  } = meaning

  return (
    <div key={index} style={styles.meaningItem}>
      <div style={styles.explain}>
        <span style={styles.wordType}>{type}</span>
        <span style={Object.assign({}, styles.wordType, { marginRight: gapL })}>{typeDesc}</span>
        {renderSentence(engExplain)}
      </div>
      <div style={styles.exampleItem}>
        <div style={{ color: colorMuted }}>{eng}</div>
        <div style={{ color: colorMuted, marginTop: 6 }}>{ch}</div>
      </div>
    </div>
  )
}

function renderWordBasic(
  wordInfo,
  synonyms: ?SynonymsType,
  search: ?(word: string) => void,
  showWordsPage: boolean,
  flash: () => {},
) {
  const { word, pronunciation, frequence, rank, additionalPattern } = wordInfo
  let synonymsEle = null

  if (synonyms && Array.isArray(synonyms.words) && synonyms.words.length > 0) {
    const { type, words: synonymsWords } = synonyms

    synonymsEle = (
      <div style={styles.synonymsContainer}>
        <span>
          {type || ''} →
        </span>
        搜索
        {synonymsWords.map(synonymsWord => (
          <a
            key={synonymsWord}
            style={styles.link}
            onClick={() => {
              if (typeof search === 'function') {
                search(synonymsWord)
              }
            }}
          >
            "{synonymsWord}"
          </a>
        ))}
      </div>
    )
  }

  return (
    <div style={styles.info}>
      <div>
        <span style={Object.assign({}, styles.infoItem, { color: colorDanger })}>
          {word}
        </span>
        {pronunciation ? (
          <span style={Object.assign({}, { fontStyle: 'italic', color: colorMuted }, styles.infoItem)}>
            {pronunciation}
          </span>
        ) : null}
        <span style={styles.infoItem}>
          <Audio word={word} />
        </span>

        {frequence ? (
          <span style={Object.assign({}, styles.infoItem, { color: colorWarning })}>
            {renderFrequence(frequence)}
          </span>
        ) : null}
        {rank ? (
          <span style={Object.assign({}, { fontSize: fontS, fontWeight: 'bold' }, styles.infoItem)}>
            {rank}
          </span>
        ) : null}
        {additionalPattern ? (
          <span style={Object.assign({}, { fontSize: fontS, color: colorMuted }, styles.infoItem)}>
            {additionalPattern}
          </span>
        ) : null}
      </div>
      {synonymsEle}
    </div>
  )
}

function renderExplain(
  response: ExplainResponseType,
  showWordsPage,
  showNotebook,
  search,
  flash,
) {
  const { meanings, synonyms, wordInfo } = response

  return (
    <div>
      {renderWordBasic(
        wordInfo, synonyms, search,
        showWordsPage, showNotebook, flash,
      )}
      <div>
        {meanings.map(renderMeaning)}
      </div>
    </div>
  )
}

function renderChoices(response: ChoiceResponseType, searchWord) {
  const { choices } = response

  return (
    <div>
      <div style={{ marginBottom: gapL }}>请选择单词: </div>
      {choices.map((choice) => {
        const { wordType, words } = choice

        return (
          <div key={words[0]} style={styles.choiceItem}>
            <span style={styles.wordType}>{wordType}</span>
            <span style={{ cursor: 'pointer', color: colorPrimary }}>
              {words.map(word => (
                <span
                  key={word}
                  style={{ marginRight: gapM }}
                  onClick={() => searchWord(word)}
                >
                  {word}
                </span>
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function renderNonCollins(
  currentWord, navigate,
  response?: NonCollinsExplainsResponseType,
  showWordsPage?: boolean,
  flash: () => {},
) {
  const wordBasic = (response && response)
    ? renderWordBasic(
      response.wordInfo,
      null,
      null,
      Boolean(showWordsPage),
      flash,
    ) : null

  const responseElement = response ? (
    <div style={{ marginBottom: `${gapL}px` }}>
      {response.explains.map(item => (
        <div key={item.explain} style={styles.choiceItem}>
          {item.type ? (
            <span style={styles.wordType}>{item.type}.</span>
          ) : null}
          <span>{item.explain}</span>
        </div>
      ))}
    </div>
  ) : null

  return (
    <div>
      {wordBasic}
      {responseElement}
      <p style={styles.errorP}>
        未搜索到柯林斯释义。
        {currentWord ? (
          <span style={styles.link} onClick={navigate}>
            去有道搜索&quot;{currentWord}&quot;
          </span>
        ) : null}
      </p>
    </div>
  )
}

function renderMachineTranslation(
  response: MachineTranslationResponseType,
) {
  const { translation } = response

  return (
    <div style={Object.assign({}, styles.choiceItem, { marginTop: gapM })}>
      (机翻) {translation}
    </div>
  )
}

class Detail extends Component {
  defaultProps: {
    currentWord: string,
  }

  refers: any
  flash: () => {}

  constructor(props: any) {
    super(props)

    this.flash = this.flash.bind(this)

    this.refers = {}
  }

  flash(msg: string) {
    this.refers.tips.flash(msg)
  }

  renderContent() {
    const { flash } = this
    const { search, currentWord, explain: wordResponse,
      openLink, showWordsPage } = this.props
    const openCurrentWord = openLink.bind(null, currentWord)
    const renderErr = renderNonCollins.bind(null, currentWord,
      openCurrentWord, undefined, showWordsPage, flash,
    )

    if (!wordResponse) {
      return renderErr()
    }

    const { response, type } = wordResponse

    if (type === 'explain') {
      return renderExplain(response, showWordsPage, search, flash)
    } else if (type === 'choices') {
      return renderChoices(response, search)
    } else if (type === 'non_collins_explain') {
      return renderNonCollins(
        currentWord, openCurrentWord, response,
        showWordsPage, flash,
      )
    } else if (type === 'machine_translation') {
      return renderMachineTranslation(response)
    }

    return renderErr()
  }

  render() {
    const element = this.renderContent()

    return (
      <div style={styles.container}>
        <Tips
          ref={tips => (this.refers.tips = tips)}
        />
        {element}
      </div>
    )
  }
}

const { func, object, string, bool } = PropTypes

Detail.propTypes = {
  currentWord: string,
  explain: object,
  search: func.isRequired,
  openLink: func.isRequired,
  showWordsPage: bool.isRequired
}

// $FlowFixMe
Detail.defaultProps = {
  currentWord: '',
  explain: null,
}

export default Detail
