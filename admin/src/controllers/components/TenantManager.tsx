import { Popconfirm, Table } from 'antd';
import "antd/lib/button/style/css";
import "antd/lib/popconfirm/style/css";
import "antd/lib/table/style/css";
import * as React from "react";
import * as utils from "../utils";
import { TenantCreateModal } from "./TenantCreateModal"

export interface ITableState {
    dataSource: any[];
    count: number;
    modalVisible: boolean;
    modalConfirmLoading: boolean;
}

export interface ITableProps {
    data: any[];
}

export class TenantManager extends React.Component<ITableProps,ITableState > {
    columns: any;
    form: any;
    constructor(props: ITableProps) {
      super(props);
      this.columns = [{
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Key',
        dataIndex: 'key',
      },
      {
        title: 'Storage',
        dataIndex: 'storage',
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        render: (text, record) => {
          return (
            this.state.dataSource.length > 1 ?
            (
              <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.key)}>
                <a href="#">Delete</a>
              </Popconfirm>
            ) : null
          );
        },
      }];
      this.state = {
        dataSource: this.props.data,
        count: this.props.data.length,
        modalVisible: false,
        modalConfirmLoading: false,
      };
    }
    onDelete = (key) => {
      const dataSource = [...this.state.dataSource];
      this.setState(
          {
              dataSource: dataSource.filter(item => item.key !== key)
          });
    }

    showModal = () => {
        this.setState({ modalVisible: true });
    }

    handleCancel = () => {
        this.setState({ modalVisible: false });
    }

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, tenant) => {
          if (err) {
            return;
          }

          this.setState({
            modalConfirmLoading: true,
          });

          utils.addTenant("http://localhost:7000/tenants", tenant).then((res) => {
            console.log(`Added tenant: ${JSON.stringify(res)}`);
            console.log('Received values of form: ', tenant);
            form.resetFields();
            this.setState({
              modalVisible: false,
              modalConfirmLoading: false,
            });
            this.addNewTenant(res);
          }, (err) => {
            console.log(err);
          });

        });
    }

    saveFormRef = (form) => {
        this.form = form;
    }

    render() {
      const { dataSource } = this.state;
      const columns = this.columns;
      return (
        <div>
          <Table bordered dataSource={dataSource} columns={columns} rowKey="_id" />
          <nav className="add-buttons">
                <a onClick={this.showModal}>
                Add new tenant
                </a>
          </nav>
          <TenantCreateModal
            ref={this.saveFormRef}
            visible={this.state.modalVisible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            confirmLoading={this.state.modalConfirmLoading}
          />
        </div>
      );
    }

    private addNewTenant(tenant: any) {
        const { count, dataSource } = this.state;
        const newData = {
          _id: tenant._id,
          name: tenant.name,
          key: tenant.key,
          storage: tenant.storage,
        };
        this.setState({
          dataSource: [...dataSource, newData],
          count: count + 1,
        });
    }
  }
