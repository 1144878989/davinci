import React, { FC, memo, useMemo, useCallback } from 'react'
import classnames from 'classnames'
import ControlComponent from '../FilterControl'
import { Row, Col, Button } from 'antd'
import {
  IRenderTreeItem,
  IMapControlOptions,
  GlobalControlQueryMode,
  IGlobalRenderTreeItem,
  IGlobalControl
} from '../types'
import styles from './Layouts.less'
import { DEFAULT_DASHBOARD_CONTROL_GRID_WIDTH } from '../constants'

interface IDashboardControlPanelLayoutProps {
  queryMode: GlobalControlQueryMode
  renderTree: IRenderTreeItem[]
  formValues: object
  mapOptions: IMapControlOptions
  onChange: (control: IGlobalControl, val: any) => void
  onSearch: (changedValues?: object) => void
  onReset: () => void
}

const DashboardControlPanelLayout: FC<IDashboardControlPanelLayoutProps> = ({
  queryMode,
  renderTree,
  formValues,
  mapOptions,
  onChange,
  onSearch,
  onReset
}) => {
  const renderControlComponents = useCallback(
    (controlRenderTreeItems: IRenderTreeItem[], parents?: IGlobalControl[]) => {
      let components = []

      controlRenderTreeItems.forEach((control) => {
        const {
          key,
          width,
          children,
          ...rest
        } = control as IGlobalRenderTreeItem
        const parentsInfo = parents
          ? parents.reduce((values, parentControl) => {
              const parentSelectedValue = formValues[parentControl.key]
              if (
                parentSelectedValue &&
                !(
                  Array.isArray(parentSelectedValue) &&
                  !parentSelectedValue.length
                )
              ) {
                values = values.concat({
                  control: parentControl,
                  value: parentSelectedValue
                })
              }
              return values
            }, [])
          : null
        const controlValue = formValues && formValues[`${control.key}`]
        const controlGridProps = width
          ? {
              lg: width,
              md: width < 8 ? 12 : 24
            }
          : DEFAULT_DASHBOARD_CONTROL_GRID_WIDTH
        components = components.concat(
          <Col key={key} {...controlGridProps}>
            <ControlComponent
              queryMode={queryMode}
              control={control}
              value={controlValue}
              currentOptions={mapOptions[key]}
              parentsInfo={parentsInfo}
              onChange={onChange}
              onSearch={onSearch}
            />
          </Col>
        )
        if (children) {
          const controlWithOutChildren = { key, width, ...rest }
          components = components.concat(
            renderControlComponents(
              children,
              parents
                ? parents.concat(controlWithOutChildren)
                : [controlWithOutChildren]
            )
          )
        }
      })
      return components
    },
    [renderTree, formValues, mapOptions]
  )

  const panelClassNames = useMemo(
    () =>
      classnames({
        [styles.dashboardControlPanel]: true,
        [styles.empty]: !renderTree.length
      }),
    [renderTree]
  )

  const manualSearch = useCallback(() => {
    onSearch()
  }, [onSearch])

  return (
    <div className={panelClassNames}>
      <div className={styles.controls}>
        <Row gutter={8}>{renderControlComponents(renderTree)}</Row>
      </div>
      {queryMode === GlobalControlQueryMode.Manually && (
        <div className={styles.actions}>
          <Button type="primary" icon="search" onClick={manualSearch}>
            查询
          </Button>
          <Button icon="reload" onClick={onReset}>
            重置
          </Button>
        </div>
      )}
    </div>
  )
}

export default memo(DashboardControlPanelLayout)
