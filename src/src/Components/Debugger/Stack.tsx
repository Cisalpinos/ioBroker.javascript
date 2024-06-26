import React, {Component} from 'react';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import ReactJson  from 'react-json-view';

import {
    ListItemButton,
    ListItemText,
    Input,
    InputAdornment,
    IconButton,
    List, Box,
} from '@mui/material';

import {
    MdCheck as CheckIcon,
    MdAdd as IconAdd,
    MdDelete as IconDelete,
} from 'react-icons/md';

import {
    I18n, IobTheme, ThemeType
} from '@iobroker/adapter-react-v5';

type NodeDebugValue = { value: any; type: string; description: string; };

const styles: Record<string, any> = {
    frameRoot: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    frameTextRoot: {
        margin: 0,
    },
    frameTextPrimary: (theme: IobTheme) => ({
        color: theme.palette.mode === 'dark' ? '#CCC' : '#333',
    }),
    frameTextSecondary: {
        fontStyle: 'italic',
        fontSize: 12,
        opacity: 0.6,
        paddingLeft: 8,
    },

    listRoot: {
        padding: 0,
    },

    scopeType: {
        verticalAlign: 'top',
        textTransform: 'uppercase',
        width: 50,
    },
    scopeType_local: {
        color: '#53a944'
    },
    scopeType_closure: {
        color: '#365b80'
    },
    scopeType_user: {
        color: '#a48a15'
    },
    scopeName: {
        color: '#bc5b5b',
        width: 'calc(100% - 82px)',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    scopeButton: {
        width: 32
    },
    scopeValueEditable: {
        cursor: 'pointer'
    },
    selectedFrame: {
        backgroundColor: '#777',
        color: 'white'
    },
    splitter: {
        width: '100%',
        height: 'calc(100% - 36px)',
        overflow: 'hidden',
        fontSize: 12
    },

    toolbarScopes: (theme: IobTheme) => ({
        width: 24,
        display: 'inline-block',
        height: '100%',
        background: theme.palette.mode === 'dark' ? '#222' : '#EEE',
        verticalAlign: 'top',
    }),
    scopesAfterToolbar: {
        width: 'calc(100% - 24px)',
        display: 'inline-block',
        height: '100%',
        verticalAlign: 'top',
    },

    scopeNameName: {
        fontWeight: 'bold',
        display: 'inline-block',
        verticalAlign: 'top',
    },
    scopeNameEqual: (theme: IobTheme) => ({
        display: 'inline-block',
        color: theme.palette.mode === 'dark' ? '#EEE' : '#222',
        verticalAlign: 'top',
    }),
    scopeNameValue: {
        verticalAlign: 'top',
        display: 'inline-block',
        color: '#3b709f',
        whiteSpace: 'nowrap',
    },
    scopeButtonDel: {
        padding: 0,
        float: 'right',
    },

    valueNull: {
        color: '#a44a24'
    },
    valueUndefined: {
        color: '#a44a24'
    },
    valueString: {
        color: '#1e8816'
    },
    valueNumber: {
        color: '#163c88'
    },
    valueBoolean: {
        color: '#a44a24'
    },
    valueObject: {
        color: '#721b70'
    },
    valueNone: {
        color: '#8a8a8a'
    },
    valueFunc: {
        color: '#ac4343'
    }
};
type NodeDebugValueWithName = { value: NodeDebugValue; name: string; };

type NodeDebugCallFrame = {
    callFrameId: string;
    id: string;
    url: string;
    functionName: string;
    location: {
        scriptId: string,
            lineNumber: number;
        columnNumber: number;
    },
};

interface NodeDebugScopes {
    id: string;
    local: {
        properties: {
            result: NodeDebugValueWithName[];
        }
    };
    closure: {
        properties: {
            result: NodeDebugValueWithName[];
        }
    };
}

type NodeDebugCallFrames = NodeDebugCallFrame[];

interface StackProps {
    currentScriptId: string;
    mainScriptId: string;
    scopes: NodeDebugScopes;
    expressions: NodeDebugValueWithName[];
    callFrames: NodeDebugCallFrames;
    currentFrame: number;
    onChangeCurrentFrame: (index: number) => void;
    onWriteScopeValue: (data: any) => void;
    onExpressionDelete: (index: number) => void;
    onExpressionAdd: (callback: (index: number, item: any) => void) => void;
    onExpressionNameUpdate: (index: number, name: string, cb: () => void) => void;
    themeType: ThemeType;
}

interface StackState {
    editValue: any;
    callFrames: NodeDebugCallFrames;
    splitSizes: [number, number];
}

class Stack extends Component<StackProps, StackState> {
    private readonly editRef: React.RefObject<HTMLInputElement>;

    private scopeValue: any;

    constructor(props: StackProps) {
        super(props);

        const splitSizesStr = localStorage.getItem('stackSplitSizes');
        let splitSizes: [number, number] = [50, 50];
        if (splitSizesStr) {
            try {
                splitSizes = JSON.parse(splitSizesStr) as [number, number];
            } catch (e) {
                // ignore
            }
            if (!Array.isArray(splitSizes) || splitSizes.length !== 2) {
                splitSizes = [50, 50];
            }
        }

        this.state = {
            editValue: null,
            callFrames: this.props.callFrames,
            splitSizes,
        };

        this.editRef = React.createRef();
    }

    onExpressionNameUpdate() {
        this.props.onExpressionNameUpdate(this.state.editValue.index, this.scopeValue, () => {
            this.setState({editValue: null});
            this.scopeValue = null;
        });
    }

    renderExpression(item: { name: string; value: NodeDebugValue }, i: number) {
        const name = this.state.editValue && this.state.editValue.type === 'expression' && this.state.editValue.index === i ?
            <Input
                inputRef={this.editRef}
                fullWidth
                margin="dense"
                onBlur={() => this.state.editValue && this.setState({ editValue: null })}
                defaultValue={item.name}
                onKeyUp={e => {
                    if (e.key === 'Enter') {
                        this.onExpressionNameUpdate();
                    } else if (e.key === 'Escape') {
                        this.setState({ editValue: null });
                    }
                }}

                onChange={e => this.scopeValue = e.target.value}

                endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={() => this.onExpressionNameUpdate()} size="medium">
                            <CheckIcon/>
                        </IconButton>
                    </InputAdornment>
                }
            />
            :
            [
                <div key="name" style={styles.scopeNameName} title={I18n.t('Double click to edit expression')}>{item.name}</div>,
                <Box component="div" key="=" sx={styles.scopeNameEqual}> = </Box>,
                <div key="val" style={styles.scopeNameValue}>{this.formatValue(item.value)}</div>
            ];

        return <tr key={`user_${i}${item.name}`}>
            <td style={{ ...styles.scopeType, ...styles.scopeType_user }}>user</td>
            <td style={styles.scopeName}
                onDoubleClick={() => {
                    this.scopeValue = item.name || '';
                    this.setState({
                        editValue: {
                            type: 'expression',
                            valueType: 'string',
                            index: i,
                            name: item.name,
                            value: item.name || ''
                        }
                    });
                }}
            >{name}</td>
            <IconButton
                style={styles.scopeButtonDel}
                size="small"
                disabled={!!this.state.editValue}
                onClick={() => this.props.onExpressionDelete(i)}
            >
                <IconDelete/>
            </IconButton>
        </tr>
    }

    renderExpressions() {
        return this.props.expressions.map((item, i) => this.renderExpression(item, i));
    }

    renderOneFrameTitle(
        frame: NodeDebugCallFrame,
        i: number,
    ) {
        if (this.props.mainScriptId === this.props.currentScriptId && frame.location.scriptId !== this.props.mainScriptId) {
            return null;
        }
        const fileName = frame.url.split('/').pop().replace(/^script\.js\./, '');
        return <ListItemButton
            key={frame.id}
            onClick={() => this.props.onChangeCurrentFrame(i)}
            dense
            selected={this.props.currentFrame === i}
            style={styles.frameRoot}
        >
            <ListItemText
                sx={{
                    '&.MuiListItemText-root': styles.frameTextRoot,
                    '&. MuiListItemText-primary': styles.frameTextPrimary,
                    '&. MuiListItemText-secondary': styles.frameTextSecondary
                }}
                title={frame.url}
                primary={frame.functionName || 'anonymous'}
                secondary={`${fileName} (${frame.location.lineNumber}:${frame.location.columnNumber})`}
            />
        </ListItemButton>;
    }

    formatValue(value: NodeDebugValue, forEdit?: boolean) {
        if (!value) {
            if (forEdit) {
                return 'none';
            }
            return <span style={styles.valueNone}>none</span>;
        } else if (value.type === 'function') {
            const text = value.description ? (value.description.length > 100 ? value.description.substring(0, 100) + '...' : value.description) : 'function';
            if (forEdit) {
                return text;
            }
            return <span style={styles.valueFunc} title={value.description}>{text}</span>;
        } else if (value.value === undefined) {
            if (forEdit) {
                return 'undefined';
            }
            return <span style={styles.valueUndefined}>undefined</span>;
        } else if (value.value === null) {
            if (forEdit) {
                return 'null';
            }
            return <span style={styles.valueNull}>null</span>;
        } else if (value.type === 'string') {
            if (forEdit) {
                return value.value;
            }
            const text = value.value ? (value.value.length > 100 ? value.value.substring(0, 100) + '...' : value.value) : '';
            return <span style={styles.valueString} title={text}>"{text}"</span>;
        } else if (value.type === 'boolean') {
            if (forEdit) {
                return value.value.toString();
            }
            return <span style={styles.valueBoolean}>{value.value.toString()}</span>;
        } else if (value.type === 'object') {
            if (forEdit) {
                return JSON.stringify(value.value);
            }
            return <ReactJson
                enableClipboard={false}
                style={{backgroundColor: 'inherit', marginTop: 3}}
                src={value.value}
                collapsed
                theme={this.props.themeType === 'dark' ? 'brewer' : 'rjv-default'}
                displayDataTypes={false}
            />;
        }

        return value.value.toString();
    }

    onWriteScopeValue() {
        if (this.scopeValue === 'true') {
            this.scopeValue = true;
        } else if (this.scopeValue === 'false') {
            this.scopeValue = false;
        } else if (this.scopeValue === 'null') {
            this.scopeValue = null;
        } else if (this.scopeValue === 'undefined') {
            this.scopeValue = undefined;
        } else
        if (parseFloat(this.scopeValue).toString() === this.scopeValue) {
            this.scopeValue = parseFloat(this.scopeValue);
        }

        this.props.onWriteScopeValue({
            variableName: this.state.editValue.name,
            scopeNumber: 0,
            newValue: {
                value: this.scopeValue,
                valueType: typeof this.scopeValue,
            },
            callFrameId: this.props.callFrames[this.props.currentFrame].callFrameId
        });

        this.setState({editValue: null});
        this.scopeValue = null;
    }

    componentDidUpdate() {
        //this.editRef.current?.select();
        this.editRef.current?.focus();
    }

    renderScope(
        scopeId: string,
        item: NodeDebugValueWithName,
        type: 'local' | 'closure',
    ) {
        const editable = !this.props.currentFrame && item.value && (item.value.type === 'undefined' || item.value.type === 'string' || item.value.type === 'number' || item.value.type === 'boolean' || item.value?.value === null || item.value?.value === undefined);

        const el = this.state.editValue && this.state.editValue.type === type && this.state.editValue.name === item.name ?
            [
                <div key="name" style={styles.scopeNameName}>{item.name}</div>,
                <div key="=" style={styles.scopeNameEqual}> = </div>,
                <Input
                    inputRef={this.editRef}
                    margin="dense"
                    onBlur={() => this.state.editValue && this.setState({editValue: null})}
                    defaultValue={this.formatValue(item.value, true)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            this.onWriteScopeValue()
                        } else if (e.key === 'Escape') {
                            this.setState({editValue: null})
                        }
                    }}
                    onChange={e =>
                        this.scopeValue = e.target.value}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => this.onWriteScopeValue()} size="medium">
                                <CheckIcon/>
                            </IconButton>
                        </InputAdornment>
                    }
                />
            ]
            :
            [
                <div key="name" style={styles.scopeNameName} title={I18n.t('Double click to write value')}>{item.name}</div>,
                <div key="=" style={styles.scopeNameEqual}> = </div>,
                <div key="val" style={styles.scopeNameValue}>{this.formatValue(item.value)} ({item.value.type})</div>
            ];


        return <tr key={`${type}_${scopeId}_${item.name}`}>
            <td style={{ ...styles.scopeType, ...styles[`scopeType_${type}`] }}>{type}</td>
            <td
                style={{
                    ...styles.scopeName,
                    ...(!this.props.currentFrame && editable ? styles.scopeValueEditable : undefined),
                }}
                onDoubleClick={() => {
                    if (editable) {
                        this.scopeValue = item.value.value;
                        this.setState({
                            editValue: {
                                scopeId,
                                type,
                                valueType: item.value.type,
                                name: item.name,
                                value: item.value.value
                            }
                        });
                    }
                }}
            >{el}</td>
        </tr>;
    }

    renderScopes(frame: NodeDebugCallFrame) {
        if (!frame) {
            return null;
        }
        // first local
        let result = this.renderExpressions();

        let items = this.props.scopes?.local?.properties?.result.map(item => this.renderScope(this.props.scopes.id, item, 'local'));
        items?.forEach(item => result.push(item));

        items = this.props.scopes?.closure?.properties?.result.map(item => this.renderScope(this.props.scopes.id, item, 'closure'));
        items?.forEach(item => result.push(item));

        return <table style={{width: '100%'}}>
            <tbody>
                {result}
            </tbody>
        </table>;
    }

    render() {
        return <ReactSplit
            direction={SplitDirection.Horizontal}
            gutterClassName={this.props.themeType === 'dark' ? 'Dark visGutter' : 'Light visGutter'}
            minWidths={[200, 200]}
            initialSizes={this.state.splitSizes}
            onResizeFinished={(gutterIdx: number, splitSizes: [number, number]) => {
                this.setState({ splitSizes: splitSizes as [number, number] });
                window.localStorage.setItem('stackSplitSizes', JSON.stringify(splitSizes));
            }}
        >
            <div style={{width: '100%', height: '100%', overflow: 'auto'}}>
                <List style={styles.listRoot}>
                    {this.props.callFrames ? this.props.callFrames.map((frame, i) =>
                        this.renderOneFrameTitle(frame, i)) : null}
                </List>
            </div>
            <div style={{width: '100%', height: '100%', overflow: 'auto'}}>
                <Box component="div" sx={styles.toolbarScopes}>
                    <IconButton size="small" onClick={() => this.props.onExpressionAdd((i, item) => {
                        this.scopeValue = item.name || '';
                        this.setState({
                            editValue: {
                                type: 'expression',
                                valueType: 'string',
                                index: i,
                                name: item.name,
                                value: item.name || ''
                            }
                        });
                    })}><IconAdd/></IconButton>
                </Box>
                <div style={styles.scopesAfterToolbar}>
                    {this.props.callFrames?.length && this.renderScopes(this.props.callFrames[this.props.currentFrame])}
                </div>
            </div>
        </ReactSplit>;
    }
}

export default Stack;
