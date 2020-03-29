/**
 * @author xue chen
 * @since 2020/3/24
 */
import React from "react";

function Row({flex, className, style, align = 'center', justify = 'center', children, onMouseLeave, onMouseEnter, onClick}) {

  return (
    <div
      style={{
        display: 'flex',
        flex,
        flexDirection: 'row',
        alignItems: align,
        justifyContent: justify,
        ...style
      }}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

function Column({flex, className, style, align = 'center', justify = 'center', children, onMouseLeave, onMouseEnter, onClick}) {

  return (
    <div
      style={{
        display: 'flex',
        flex,
        flexDirection: 'Column',
        alignItems: align,
        justifyContent: justify,
        ...style
      }}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )

}

export {Row, Column}
