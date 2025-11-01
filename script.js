const tooltipTemplate = `
    <div class="chart-tooltip" id="chartjs-tooltip">
        <p class="chart-tooltip__date">{{date}}
            <svg class="chart-tooltip__close" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.2821 6.78055L6.78055 15.2821C6.49008 15.5726 6.00832 15.5726 5.71785 15.2821C5.42738 14.9917 5.42738 14.5099 5.71785 14.2194L14.2194 5.71785C14.5099 5.42738 14.9917 5.42738 15.2821 5.71785C15.5726 6.00832 15.5726 6.49008 15.2821 6.78055Z" fill="#090714"/>
                <path d="M15.2821 15.2821C14.9917 15.5726 14.5099 15.5726 14.2194 15.2821L5.71785 6.78055C5.42738 6.49008 5.42738 6.00832 5.71785 5.71785C6.00832 5.42738 6.49008 5.42738 6.78055 5.71785L15.2821 14.2194C15.5726 14.5099 15.5726 14.9917 15.2821 15.2821Z" fill="#090714"/>
            </svg>
        </p>
        <div class="chart-tooltip__items">
            {{categories}}
        </div>
        <div class="chart-tooltip__divider"></div>
        <div class="chart-tooltip__resume">
            <p class="chart-tooltip__resume-title">Всего замечаний</p>
            <p class="chart-tooltip__resume-total">{{total}} <span>шт</span></p>
        </div>
        <svg class="chart-tooltip__icon" width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10.6159 12.7842C9.81708 13.8796 8.18292 13.8796 7.38408 12.7842L0.925705 3.92847C-0.0381527 2.60682 0.905849 0.75 2.54163 0.75H15.4584C17.0942 0.75 18.0382 2.60682 17.0743 3.92847L10.6159 12.7842Z"
                fill="#F6F6F6" />
        </svg>
    </div>
`;

const categoryTemplate = `
    <div class="chart-tooltip__category">
        <p class="chart-tooltip__category-title">{{title}}</p>
        <p class="chart-tooltip__category-count">
            {{count}} <span>шт</span>
        </p>
    </div>
`;

document.addEventListener('DOMContentLoaded', function () {
    const allTabs = document.querySelectorAll('.tabs')

    const initTabs = (tabs) => {
        const tab = tabs.querySelectorAll('.tab')

        tab.forEach(el => {
            el.onclick = () => {
                const activeTab = tabs.querySelector('.tab.active')
                activeTab.classList.remove('active')
                el.classList.add('active')
            }
        })
    }

    allTabs.forEach(tabs => initTabs(tabs))

    const swiper = new Swiper('.tabs', {
        slidesPerView: 'auto',
        spaceBetween: 0,
    });

    let tooltipEl = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        const main = document.querySelector('main')
        main.appendChild(tooltipEl);
    }

    const ctx = document.getElementById('chart');

    const labels = [
        '2025-01-01',
        '2025-02-01',
        '2025-03-01',
        '2025-04-01',
        '2025-05-01',
        '2025-06-01',
    ];

    const pointStyle = {
        pointBackgroundColor: '#7A45E6',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 0.01,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointStyle: 'circle',
        pointHitRadius: 6,
        z: 1
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'На проверке',
                data: [8, 20, 1, 30, 7, 7, 75],
                fill: false,
                borderColor: '#7A45E6',
                ...pointStyle
            },
            {
                label: 'В работе',
                data: [16, 40, 33, 20, 52, 60, 65],
                fill: false,
                borderColor: '#00B8A9',
                ...pointStyle
            },
            {
                label: 'К устранению',
                data: [25, 15, 45, 10, 30, 55, 20],
                fill: false,
                borderColor: '#BA98FF',
                ...pointStyle
            },
        ]
    };

    const total = {
        label: 'total',
        data: [],
        fill: false,
        borderColor: '#090714',
        tension: 0.1,
        ...pointStyle
    }

    data.datasets[0].data.forEach((el, index) => {
        let totalInPeriod = 0
        data.datasets.forEach(line => {
            totalInPeriod += line.data[index]
        })
        total.data.push(totalInPeriod)
    })

    data.datasets.push(total)

    const tooltip = {
        enabled: false,

        external: function (context) {
            let tooltipEl = document.getElementById('chartjs-tooltip');

            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.innerHTML = tooltipTemplate
                const main = document.querySelector('main')
                main.appendChild(tooltipEl);
            }

            const tooltipModel = context.tooltip;

            if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
            }

            if (tooltipModel.body) {
                const title = tooltipModel.title[0] || '';
                const dataIndex = tooltipModel.dataPoints[0].dataIndex;

                const totalLabel = 'total';
                const categories = data.datasets
                    .filter(dataset => dataset.label !== totalLabel)
                    .map(dataset => ({
                        title: dataset.label,
                        count: dataset.data[dataIndex]
                    }));


                const totalDataset = data.datasets.find(dataset => dataset.label === totalLabel);
                const total = totalDataset ? totalDataset.data[dataIndex] : categories.reduce((sum, category) => sum + category.count, 0);


                const tooltipData = {
                    date: title,
                    categories: categories,
                    total: total
                };

                updateTooltip(tooltipData);
            }

            const position = context.chart.canvas.getBoundingClientRect();
            const tooltipIcon = document.querySelector('.chart-tooltip__icon')

            requestAnimationFrame(() => {
                let tooltipX = position.left + window.pageXOffset + tooltipModel.caretX;
                let tooltipY = position.top + window.pageYOffset + tooltipModel.caretY;

                const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

                const tooltipWidth = tooltipEl.offsetWidth;
                const tooltipHeight = tooltipEl.offsetHeight;

                const tooltipOffset = window.innerWidth > 1920 ? 30 : window.innerWidth > 1270 ? 40 : 15

                const chart = document.querySelector('#chart')

                const rightOffset = Math.floor(chart.clientWidth - tooltipModel.caretX)

                if (tooltipX - (tooltipWidth / 2) + tooltipWidth + 15 > windowWidth) {
                    tooltipX = windowWidth - tooltipWidth - tooltipOffset;
                    tooltipEl.style.left = tooltipX + 'px';
                    tooltipIcon.style.left = tooltipWidth - 18 - rightOffset + 'px';
                } else if (tooltipX - (tooltipWidth / 2) < 0) { 
                    tooltipEl.style.left = tooltipOffset + 'px';
                    tooltipIcon.style.left = tooltipModel.caretX - 18 + 'px';
                } else {
                    tooltipEl.style.left = tooltipX - tooltipWidth / 2 + 'px';
                    tooltipIcon.removeAttribute('style')
                }

                tooltipEl.style.opacity = 1;
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.top = tooltipY - tooltipHeight - 12 + 'px';
                tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
                tooltipEl.style.pointerEvents = 'none';
            })

        }
    }

    function updateTooltip(data) {

        let categoriesHTML = "";
        if (data.categories && Array.isArray(data.categories)) {
            categoriesHTML = data.categories.map(category => {
                let renderedCategory = categoryTemplate.replace("{{title}}", category.title);
                renderedCategory = renderedCategory.replace("{{count}}", category.count);
                return renderedCategory;
            }).join("");
        }

        let renderedHTML = tooltipTemplate.replace("{{date}}", capitalizeFirstLetter(data.date) || "");
        renderedHTML = renderedHTML.replace("{{categories}}", categoriesHTML);
        renderedHTML = renderedHTML.replace("{{total}}", data.total || 0);

        const tooltipElement = document.getElementById("chartjs-tooltip");
        if (tooltipElement) {
            tooltipElement.innerHTML = renderedHTML;
        } else {
            console.warn("Tooltip element with id 'chartjs-tooltip' not found.");
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const config = {
        type: 'line',
        data: data,
        options: {
            parsing: true,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip,
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMMM',
                        },
                        tooltipFormat: 'EEEE, dd MMMM yyyy',
                    },
                    adapters: {
                        date: {
                            locale: dateFns.locale.ru,
                        },
                    },
                    ticks: {
                        callback: (date) => {
                            const newDate = dateFns.format(date, 'MMMM', { locale: dateFns.locale.ru });
                            return capitalizeFirstLetter(newDate)
                        },
                        source: 'data',
                        autoSkip: true,
                        maxRotation: 0,
                        padding: 12,
                        font: {
                            size: 16,
                            family: 'Suisse Intl',
                            weight: '400',
                            lineHeight: '160%'
                        },
                        color: '#090714'
                    },
                    grid: {
                        drawBorder: false,
                        drawTicks: false,
                        drawOnChartArea: false,
                        display: false,
                        color: '#F2F2F2',
                        lineWidth: 1,
                    },
                },
                y: {
                    ticks: {
                        font: {
                            size: 14,
                            family: 'Suisse Intl',
                            weight: '400',
                            lineHeight: '100%'
                        },
                        color: '#9C9AA5',
                    },
                    grid: {
                        display: true,
                        color: '#F2F2F2',
                        lineWidth: 1,
                    },
                }
            }
        },
    };
    new Chart(ctx, config);

    const closeTooltip = () => {
        tooltipEl.style.top = 0
        tooltipEl.style.left = 'unset'
        tooltipEl.style.right = 'unset'
        tooltipEl.style.opacity = 0
        tooltipEl.style.pointerEvents = 'none'
    }

    window.addEventListener('resize', () => {
        closeTooltip()
    })
})