import React from 'react'
import { Button, ButtonGroup, Popover, Checkbox, Tag, Position } from '@blueprintjs/core'
import { osInfo, osKeys, channelInfo, channelKeys } from './util'

export default class ReleaseFilter extends React.PureComponent {
    render() {
        return (
            <ButtonGroup style={{float: 'right'}}>
                {!this.props.hideOs && this._renderFilters('Operating System', 'os', osKeys, osKeys.map(osKey => osInfo[osKey].name))}
                {this._renderFilters('Release Channel', 'channel', channelKeys, channelKeys.map(channelKey => {
                    return <Tag intent={channelInfo[channelKey].color}>{channelKey}</Tag>
                }))}
                {this._renderFilters('Major Version', 'majorVersion', this.props.majorVersions, this.props.majorVersions)}
            </ButtonGroup>
        )
    }

    _renderFilters(name, type, keys, displays) {
        const onKeys = keys.filter(key => this.props.filters[type].includes(key))
        const onIndices = onKeys.map(key => keys.findIndex(key2 => key2 === key))
        const label = onKeys.length > 0 ? onIndices.map((i, j) => <React.Fragment key={i}>{displays[i]}{j !== onKeys.length - 1 && ', '}</React.Fragment>) : name
        return (
            <Popover content={this._renderPopoverContent(type, keys, displays)} position={Position.BOTTOM_LEFT}>
                <Button rightIcon="caret-down" text={label}/>
            </Popover>
        )
    }

    _renderPopoverContent(type, keys, displays) {
        return (
            <ul className="bp3-menu">
                {
                    keys.map((key, i) => {
                        const checked = this.props.filters[type].includes(key)
                        return (
                            <li key={key} className="bp3-menu-item">
                                <Checkbox checked={checked} label={displays[i]} onChange={(e) => {
                                    this.props.onFilter(type, key, e.target.checked)
                                }}/>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }
}
