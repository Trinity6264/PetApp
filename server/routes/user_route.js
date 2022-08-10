const express = require('express')

const router = express.Router()

const {createUser,deleteUser,loginUser,updateUser,getdocs,getdoc,searchUser,verifyEmail} = require('../backend/controllers/user_controller')


router.post('/create',createUser)
router.post('/login',loginUser)
router.get('/getusers',getdocs)
router.get('/search',searchUser)
router.get('/verify-email',verifyEmail)
router.route('/getuser/:id').get(getdoc).delete(deleteUser).patch(updateUser)


module.exports = router