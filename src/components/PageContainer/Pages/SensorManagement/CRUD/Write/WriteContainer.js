import {VscClose} from "react-icons/vsc"
import FormContainer from "./FormContainer"
import ConfirmCloseModal from "../SharedComponents/ConfirmCloseModal"
import { useState } from "react"
//TODO add dynamic theme to map
const WriteContainer = ({menuOpen, setMenuOpen, setTableRefresh, rowData, darkTheme}) => {

    const [modalOpen, setModalOpen] = useState(false)
    const [changes, setChanges] = useState(false)

    function handleClose(e){
        if(e.target.id === "modal"){
            if(changes){
                setModalOpen(true)
            }
            else{
                setMenuOpen(false)
            }
        }
    }

    if (menuOpen !== false){
        if(menuOpen.includes("Create") || menuOpen.includes("Edit")){
            return (
                <> 
                <div id = "modal" onClick={handleClose} className="modal-container">
                    <div className="crud-container">
                        <h5 className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
                            {menuOpen}
                        </h5>
                        <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                            <VscClose size={32}/>
                        </button>
    
                        <FormContainer menuOpen={menuOpen} setMenuOpen={setMenuOpen} rowData={rowData} setChanges={setChanges} darkTheme = {darkTheme} setTableRefresh = {setTableRefresh}/>
                    </div>
                </div>
                {modalOpen ? <ConfirmCloseModal setMenuOpen={setMenuOpen} setModalOpen={setModalOpen} setChanges={setChanges}/> : null}
                </>   
            )
        }
    } 
}



export default WriteContainer
