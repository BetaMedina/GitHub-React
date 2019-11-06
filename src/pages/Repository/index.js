import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  FilterIssue,
  LoadDiv,
  Controller,
} from './styles';

import Container from '../../components/container/index';

export default class Repository extends Component {
  state = {
    issue: [],
    repository: {},
    loading: true,
    filter: '',
    loadingRepository: false,
    page: 1,
  };

  async componentDidMount() {
    await this.handleSearch();
  }

  handleSearch = async () => {
    const { match } = this.props;
    const { filter, page } = this.state;
    this.setState({
      loadingRepository: true,
      issue: [],
    });
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: `${filter || 'open'}`,
          per_page: '30',
          page: `${page}`,
        },
      }),
    ]);
    this.setState({
      loading: false,
      issue: issues.data,
      repository: repository.data,
      loadingRepository: false,
    });
  };

  handleChange = async e => {
    await this.setState({ filter: e.target.value });
    await this.handleSearch();
  };

  handlePage = async act => {
    const { page } = this.state;
    await this.setState({ page: act === 'nxt' ? page + 1 : page - 1 });
    this.handleSearch();
  };

  render() {
    const { repository, issue, loading, loadingRepository, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <FilterIssue onChange={this.handleChange} defaultValue="open">
            <option value="all">Todas</option>
            <option value="open">Abertas</option>
            <option value="closed">Fechadas</option>
          </FilterIssue>

          {loadingRepository && (
            <LoadDiv className="loading">
              <FaSpinner color="#333" size={60} />
            </LoadDiv>
          )}

          {issue.map(res => (
            <li key={String(res.id)}>
              <img src={res.user.avatar_url} alt={res.user.login} />
              <div>
                <strong>
                  <a rel="noopener" href={res.html_url}>
                    {res.title}
                  </a>
                  {res.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{res.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Controller>
          <button
            disabled={page === 1}
            onClick={() => this.handlePage('ant')}
            type="button"
          >
            anterior
          </button>
          <button type="button" onClick={() => this.handlePage('nxt')}>
            proximo
          </button>
        </Controller>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
