import React from 'react'
import Layout from '../../../component/Layout'
import "../../../src/app/styles/main.scss";
import RegisteredUi from '../../../component/registered-users';


const RegisteredUseUi = () => {
    return (
        <div>
            <Layout>
                 <RegisteredUi/>
            </Layout>
           
        </div>
    )
}

export default RegisteredUseUi