import { mount } from '@vue/test-utils'
import Component from '../CDataTable'

const ComponentName = 'CDataTable'
const defaultWrapper = mount(Component)

const items = [
  {username: 'Estavan Lykos', registered: '2012/02/01', role: 'Staff', status: 'Banned'},
  {username: 'Chetan Mohamed', registered: '2012/02/01', role: 'Admin', status: 'Inactive'},
  {username: 'Derick Maximinus', registered: '2012/03/01', role: 'Member', status: 'Pending'},
  {username: 'Yiorgos Avraamu', registered: '2012/01/01', role: 'Member', status: 'Active'},
  {
    username: 'Friderik Dávid', 
    registered: '2012/01/21',
    role: 'Staff', 
    status: 'Active',
    _cellClasses: { registered: 'custom-cell-class' }
  },
]

const customWrapper = mount(Component, {
  propsData: {
    items,
    fields: [
      { key: 'username', _style:'width:40%', _classes: 'user-custom-class' },
      'registered',
      { key: 'role', _style:'width:20%;' },
      { key: 'status', _style:'width:20%;' },
      { key: 'show_details' , label:'', _style:'width:1%', sorter: false, filter: false },
    ],

    tableFilter: true,
    itemsPerPageSelect: true,
    addTableClasses: 'additional-table-class',
    sorter: true,
    small: false,
    dark: true,
    striped: true,
    fixed: false,
    hover: true,
    border: true,
    outlined: true,
    columnFilter: true,
    footer: true,
    sorterValue: { column: 'username', asc: false },
    columnFilterValue: { registered: '2012', 'non_existing': 'smh' },
    pagination: true
  }
})

describe(ComponentName, () => {
  it('has a name', () => {
    expect(Component.name).toMatch(ComponentName)
  })
  it('renders correctly', () => {
    expect(defaultWrapper.element).toMatchSnapshot()
  })
  it('renders correctly', () => {
    expect(customWrapper.element).toMatchSnapshot()
  })
  it('changes sorting correctly', () => {
    expect(customWrapper.vm.sortedItems[0].username).toBe('Yiorgos Avraamu')
    customWrapper.find('tr').findAll('th').at(3).trigger('click')
    expect(customWrapper.vm.sortedItems[0].status).toBe('Active')

    customWrapper.find('tr').findAll('th').at(3).trigger('click')
    expect(customWrapper.vm.sortedItems[0].status).toBe('Pending')
  })
  it('doesnt change sorter when clicked on not sortable column', () => {
    const oldSorterColumn = customWrapper.vm.sorter.column
    customWrapper.find('tr').findAll('th').at(4).trigger('click')
    expect(customWrapper.vm.sorter.column).toBe(oldSorterColumn)
  })
  it('renders pretified column names when fields are not defined', () => {
    customWrapper.setProps({ fields: undefined })
    expect(customWrapper.vm.columnNames[0]).toBe('Username')
  })
  // it('changes colspan when indexColumn is switched', () => {
  //   const colspanWithIndexColumn = customWrapper.vm.colspan
  //   customWrapper.setProps({ indexColumn: false })
  //   expect(customWrapper.vm.colspan).toBe(colspanWithIndexColumn - 1)
  // })
  it('table filter works correctly', () => {
    customWrapper.setProps({ tableFilterValue: 'Yiorgos' })
    expect(customWrapper.vm.sortedItems.length).toBe(1)
    customWrapper.setProps({ tableFilterValue: null })
  })
  it('shows loading layer when loading prop is set', () => {
    customWrapper.setProps({ loading: true })
    expect(customWrapper.contains('.spinner-border')).toBe(true)
    customWrapper.setProps({ loading: false })
  })
  it('emits event when items per page changes', () => {
    customWrapper.findAll('option').at(2).setSelected()
    expect(customWrapper.emitted()['pagination-change'][0][0]).toBe(10)
  })
  it('emits event when row is clicked', () => {
    customWrapper.find('tbody').find('tr').trigger('click')
    expect(customWrapper.emitted()['row-clicked']).toBeTruthy()
  })
  it('correctly updates items', () => {
    //test if watcher is not fired by coverage
    customWrapper.setProps({ items: items.slice() })
    expect(customWrapper.vm.sortedItems.length).toBe(5)

    const newItems = items.slice(0, 4)
    customWrapper.setProps({ items: newItems })
    expect(customWrapper.vm.sortedItems.length).toBe(4)
  })
  it('correctly filter by table filter after input or change event', () => {
    const input = customWrapper.find('input')
    const firstUsername = () => customWrapper.vm.sortedItems[0].username
    input.setValue('Estavan')
    expect(firstUsername()).toMatch('Estavan')
    input.element.value = "Chetan"
    input.trigger('change')
    expect(firstUsername()).toMatch('Chetan')
  })
  it('triggers proper events on column input change', () => {
    const input = customWrapper.findAll('tr').at(1).find('input')
    const changeEmmited = () => customWrapper.emitted()['update:column-filter-value']
    const inputEmmited = () => customWrapper.emitted()['column-filter-input']

    expect(changeEmmited()).not.toBeTruthy()
    expect(inputEmmited()).not.toBeTruthy()
    input.trigger('change')
    expect(changeEmmited()).toBeTruthy()
    input.trigger('input')
    expect(inputEmmited()).toBeTruthy()
  })
})
