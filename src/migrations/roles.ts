export default [
  {
    _id: '5eeb952dc4b8c545f46e7e01',
    roles: ['all'],
    active: true,
    name: 'super',
  },
  {
    _id: '5eeb952dc4b8c545f46e7e02',
    roles: [
      'brandQuery',
      'brandSave',
      'brandDelete',
      'categoryQuery',
      'categorySave',
      'categoryDelete',
    ],
    active: true,
    name: 'admin',
  },
  {
    _id: '5eeb952dc4b8c545f46e7e03',
    roles: ['brandQuery', 'brandSave', 'categoryQuery', 'categorySave'],
    active: true,
    name: 'manager',
  },
  {
    _id: '5eeb952dc4b8c545f46e7e04',
    roles: ['brandQuery', 'brandSave', 'categoryQuery', 'categorySave'],
    active: true,
    name: 'vendor',
  },
  {
    _id: '5eeb952dc4b8c545f46e7e05',
    roles: ['brandQuery', 'categoryQuery'],
    active: true,
    name: 'user',
  },
]
