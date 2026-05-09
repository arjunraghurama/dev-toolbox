import { useState } from 'react'
import JsonViewer from './JsonViewer'
import DiffViewer from './DiffViewer'

function App() {
  const [activeTool, setActiveTool] = useState('formatter') // 'formatter' | 'compare'
  
  // Formatter State
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [parsedJsonData, setParsedJsonData] = useState(null)

  // Compare State
  const [input2, setInput2] = useState('')
  const [showDiff, setShowDiff] = useState(false)

  const handleProcess = (action) => {
    setError('')
    setParsedJsonData(null)
    
    if (!input.trim()) {
      setError('Input is empty.')
      return
    }

    if (action === 'remove_newlines') {
      setOutput(input.replace(/\n/g, ''))
      return
    }

    try {
      const parsed = JSON.parse(input)
      
      switch (action) {
        case 'format':
          setOutput(JSON.stringify(parsed, null, 2))
          setParsedJsonData(parsed)
          break
        case 'stringify':
          setOutput(JSON.stringify(parsed))
          break
        case 'python': {
          let pyStr = JSON.stringify(parsed, null, 2)
            .replace(/:\s*true\b/g, ': True')
            .replace(/:\s*false\b/g, ': False')
            .replace(/:\s*null\b/g, ': None')
            .replace(/,\s*true\b/g, ', True')
            .replace(/,\s*false\b/g, ', False')
            .replace(/,\s*null\b/g, ', None')
            .replace(/\[\s*true\b/g, '[True')
            .replace(/\[\s*false\b/g, '[False')
            .replace(/\[\s*null\b/g, '[None');
          setOutput(pyStr)
          break
        }
        default:
          break
      }
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`)
    }
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(err => {
          console.error('Failed to copy!', err);
        })
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar for Navigation / Tools */}
      <div className="sidebar">
        <div className="sidebar-brand">Dev Toolbox</div>
        
        <div className="sidebar-section">
          <div className="sidebar-title">Formatters</div>
          <div className="sidebar-menu">
            <button 
              className={`sidebar-btn ${activeTool === 'formatter' ? 'active' : ''}`}
              onClick={() => setActiveTool('formatter')}
            >
              JSON Formatter
            </button>
            <button className="sidebar-btn" disabled title="Coming soon">YAML Formatter</button>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Utilities</div>
          <div className="sidebar-menu">
            <button 
              className={`sidebar-btn ${activeTool === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTool('compare')}
            >
              JSON Compare
            </button>
            <button className="sidebar-btn" disabled title="Coming soon">Base64 Encode</button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="workspace">
        <div className="header">
          <h1>{activeTool === 'compare' ? 'JSON Compare' : 'Editor Workspace'}</h1>
          <div className="controls-bar">
            {activeTool === 'formatter' && (
              <>
                <button className="primary" onClick={() => handleProcess('format')}>Format JSON</button>
                <button onClick={() => handleProcess('stringify')}>Stringify</button>
                <button onClick={() => handleProcess('remove_newlines')}>Remove \n</button>
                <button onClick={() => handleProcess('python')}>Python Format</button>
              </>
            )}
            {activeTool === 'compare' && (
              <button 
                className="primary" 
                onClick={() => setShowDiff(true)} 
                disabled={!input.trim() || !input2.trim()}
              >
                Compare
              </button>
            )}
          </div>
        </div>

        {error && activeTool === 'formatter' && <div className="error-message">{error}</div>}

        <div className="main-content">
          {activeTool === 'formatter' ? (
            // Formatter Layout
            <>
              <div className="editor-pane">
                <div className="pane-header">Input</div>
                <div className="pane-content">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    spellCheck="false"
                  />
                </div>
              </div>
              <div className="editor-pane">
                <div className="pane-header">
                  <span>Output</span>
                  <div className="pane-actions">
                    <button className="icon-btn" onClick={handleCopy} disabled={!output} title="Copy Output">
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="pane-content">
                  {parsedJsonData ? (
                    <JsonViewer data={parsedJsonData} />
                  ) : (
                    <textarea
                      value={output}
                      readOnly
                      placeholder="Result will appear here..."
                      spellCheck="false"
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            // Compare Layout (Side-by-side Inputs, Diff overlays Modified JSON)
            <div className="compare-inputs" style={{ display: 'flex', flexDirection: 'row', gap: '16px', flex: 1, minHeight: 0 }}>
              <div className="editor-pane">
                <div className="pane-header">Original JSON</div>
                <div className="pane-content">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setShowDiff(false);
                    }}
                    placeholder="Paste original JSON here..."
                    spellCheck="false"
                  />
                </div>
              </div>
              <div className="editor-pane">
                <div className="pane-header">
                  <span>Modified JSON {showDiff ? '(Diff Output)' : ''}</span>
                  <div className="pane-actions">
                    {input2.trim() && (
                      <button className="icon-btn" onClick={() => { setInput2(''); setShowDiff(false); }} title="Clear Modified">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="pane-content">
                  {showDiff ? (
                    <DiffViewer original={input} modified={input2} />
                  ) : (
                    <textarea
                      value={input2}
                      onChange={(e) => {
                        setInput2(e.target.value);
                        setShowDiff(false);
                      }}
                      placeholder="Paste modified JSON here to see diff..."
                      spellCheck="false"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
