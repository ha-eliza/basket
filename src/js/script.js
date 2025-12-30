import { loadJSON } from './api.js'
import { handleCloseModal, handleOpenModal, handleSubmit } from './handlers.js'

// подгрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', loadJSON)

handleSubmit()
handleOpenModal()
handleCloseModal()
